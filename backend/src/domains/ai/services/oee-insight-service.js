const Machine = require('../../machines/models/machine-model');
const AiInsight = require('../models/ai-insight-model');
const oeeCalculatorService = require('../../oee/services/oee-calculator-service');
const { buildWindowKey, toWindowPayload } = require('../utils/window-utils');
const { buildLossBreakdown } = require('./loss-breakdown-service');
const { buildUsageExpiresAt, createUsageLog } = require('./ai-usage-service');
const { checkAndConsume } = require('./ai-rate-limit-service');
const openaiClient = require('./openai-client');
const { PROMPT_VERSION, buildOeeInsightPrompt } = require('../prompts/oee-insight');
const { buildOeeSnapshotHash, buildOeeSnapshotPayload } = require('../utils/oee-hash-utils');
const {
  USE_CASES,
  USE_CASE_TTL_DAYS,
} = require('../utils/ai-constants');
const AppError = require('../../../utils/app-error');

const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;
const DEFAULT_TIMEZONE = 'Europe/Istanbul';

const computeExpiresAt = (useCase, now = new Date()) => {
  const days = USE_CASE_TTL_DAYS[useCase] || 30;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
};

const getCacheTtlMs = () => Number(process.env.AI_CACHE_TTL_MS) || DEFAULT_CACHE_TTL_MS;

const parseJsonFromText = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw error;
  }
};

const toShiftDateYmd = (date) => {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
};

const buildWindow = ({ mode, shiftDate, from, to, windowStart, windowEnd, timezone }) => {
  if (mode === 'shift') {
    const shiftDateYmd = shiftDate || toShiftDateYmd(windowStart);
    return toWindowPayload({
      mode: 'shift',
      shiftDateYmd,
      timezone,
    });
  }
  const fromMs = from ? new Date(from).getTime() : windowStart.getTime();
  const toMs = to ? new Date(to).getTime() : windowEnd.getTime();
  return toWindowPayload({
    mode: 'range',
    fromMs,
    toMs,
    timezone,
  });
};

const buildOperatorHighlights = (operatorStats = []) => {
  return operatorStats
    .filter((item) => item.id && item.id !== 'unassigned')
    .slice(0, 3)
    .map((item) => ({
      name: [item.firstName, item.lastName].filter(Boolean).join(' ') || item.username,
      oee: item.oee ?? 0,
      availability: item.availability ?? 0,
      performance: item.performance ?? 0,
      quality: item.quality ?? 0,
    }));
};

const buildWindowLabel = (window) => {
  if (!window) return 'Bilinmeyen';
  if (window.mode === 'shift') {
    return `Shift ${window.shiftDateYmd}`;
  }
  const fromLabel = new Date(window.fromMs).toISOString();
  const toLabel = new Date(window.toMs).toISOString();
  return `Range ${fromLabel} - ${toLabel}`;
};

const generateOeeInsight = async ({
  userId,
  machineId,
  source,
  mode,
  shiftDate,
  from,
  to,
  timezone,
  forceRefresh,
}) => {
  if (!machineId) {
    throw new AppError('machineId zorunludur.', 400);
  }

  const stats = await oeeCalculatorService.calculateOeeForMachine({
    machineId,
    mode,
    shiftDate,
    from,
    to,
    source,
  });

  const windowStart = stats.windowStart ? new Date(stats.windowStart) : new Date();
  const windowEnd = stats.windowEnd ? new Date(stats.windowEnd) : new Date();
  const window = buildWindow({
    mode: stats.mode,
    shiftDate,
    from,
    to,
    windowStart,
    windowEnd,
    timezone: timezone || DEFAULT_TIMEZONE,
  });
  const windowKey = buildWindowKey(window);
  if (!windowKey) {
    throw new AppError('WindowKey olusturulamadi.', 400);
  }

  const lossBreakdown = await buildLossBreakdown({
    machineId,
    source: stats.source,
    mode: window.mode,
    shiftDateYmd: window.shiftDateYmd,
    windowStart,
    windowEnd,
  });

  const hashPayload = buildOeeSnapshotPayload({ stats, lossBreakdown });
  const dataSnapshotHash = buildOeeSnapshotHash({ stats, lossBreakdown });

  const cacheTtlMs = getCacheTtlMs();
  const now = new Date();

  if (!forceRefresh) {
    const cached = await AiInsight.findOne({
      createdBy: userId,
      useCase: USE_CASES.OEE_INSIGHT,
      machineId,
      source: stats.source,
      windowKey,
      dataSnapshotHash,
    })
      .sort({ generatedAt: -1 })
      .lean();

    if (cached && now.getTime() - new Date(cached.generatedAt).getTime() <= cacheTtlMs) {
      const usageLog = {
        createdBy: userId,
        useCase: USE_CASES.OEE_INSIGHT,
        source: stats.source,
        machineId,
        windowKey,
        promptVersion: cached.promptVersion,
        model: cached.model,
        forceRefresh: Boolean(forceRefresh),
        cacheHit: true,
        insightId: cached._id,
        latencyMs: 0,
        status: 'success',
        tokensIn: 0,
        tokensOut: 0,
        tokensTotal: 0,
        estimatedCostUsd: 0,
        rateLimitState: { cacheHit: true },
      };
      await createUsageLog({ ...usageLog, expiresAt: buildUsageExpiresAt(now) });

      return { insight: cached, cacheHit: true, rateLimitMeta: null };
    }
  }

  const rateLimit = checkAndConsume({
    userId,
    useCase: USE_CASES.OEE_INSIGHT,
    estimatedCostUsd: 0.0006,
    consume: true,
  });

  if (!rateLimit.allowed) {
    await createUsageLog({
      createdBy: userId,
      useCase: USE_CASES.OEE_INSIGHT,
      source: stats.source,
      machineId,
      windowKey,
      promptVersion: PROMPT_VERSION,
      model: openaiClient.getConfig().model,
      forceRefresh: Boolean(forceRefresh),
      cacheHit: false,
      latencyMs: 0,
      status: 'blocked',
      rateLimitState: rateLimit.rateLimitMeta,
      expiresAt: buildUsageExpiresAt(now),
    });

    const error = new AppError('AI limit aşıldı.', 429);
    error.meta = rateLimit.rateLimitMeta;
    throw error;
  }

  const machine = await Machine.findById(machineId).select({ code: 1, name: 1 }).lean();
  const operatorHighlights = buildOperatorHighlights(stats.operatorStats);

  const prompt = buildOeeInsightPrompt({
    machineName: machine?.name || machine?.code || String(machineId),
    windowLabel: buildWindowLabel(window),
    source: stats.source,
    availability: stats.availability,
    performance: stats.performance,
    quality: stats.quality,
    oee: stats.oee,
    plannedTimeMs: stats.plannedTime,
    operatingTimeMs: stats.operatingTime,
    goodCount: stats.goodCount,
    defectCount: stats.defectCount,
    topReasons: lossBreakdown.topReasons,
    operatorHighlights,
  });

  const startedAt = Date.now();
  const response = await openaiClient.requestResponse({
    input: prompt,
    max_output_tokens: 600,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - startedAt;

  const outputText = response.output_text || response.output?.[0]?.content?.[0]?.text || '';
  const parsedOutput = parseJsonFromText(outputText);

  const expiresAt = computeExpiresAt(USE_CASES.OEE_INSIGHT, now);

  const insightDoc = await AiInsight.create({
    useCase: USE_CASES.OEE_INSIGHT,
    createdBy: userId,
    machineId,
    source: stats.source,
    window,
    windowKey,
    dataSnapshotHash,
    hashVersion: 1,
    promptVersion: PROMPT_VERSION,
    provider: 'openai',
    model: openaiClient.getConfig().model,
    normalizedInput: {
      window,
      oee: hashPayload,
      lossBreakdown,
      operatorHighlights,
    },
    output: parsedOutput,
    tokenUsage: response.usage || null,
    generatedAt: now,
    expiresAt,
  });

  const tokensIn = response.usage?.input_tokens || response.usage?.prompt_tokens || 0;
  const tokensOut = response.usage?.output_tokens || response.usage?.completion_tokens || 0;
  const tokensTotal = response.usage?.total_tokens || tokensIn + tokensOut;

  await createUsageLog({
    createdBy: userId,
    useCase: USE_CASES.OEE_INSIGHT,
    source: stats.source,
    machineId,
    windowKey,
    promptVersion: PROMPT_VERSION,
    model: openaiClient.getConfig().model,
    forceRefresh: Boolean(forceRefresh),
    cacheHit: false,
    insightId: insightDoc._id,
    latencyMs,
    status: 'success',
    tokensIn,
    tokensOut,
    tokensTotal,
    estimatedCostUsd: 0,
    rateLimitState: rateLimit.rateLimitMeta,
    expiresAt: buildUsageExpiresAt(now),
  });

  return { insight: insightDoc.toObject(), cacheHit: false, rateLimitMeta: rateLimit.rateLimitMeta };
};

module.exports = {
  generateOeeInsight,
};
