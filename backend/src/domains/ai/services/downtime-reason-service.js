const MachineEvent = require('../../machines/models/machine-event-model');
const Machine = require('../../machines/models/machine-model');
const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const AiInsight = require('../models/ai-insight-model');
const oeeRulesService = require('../../oee/services/oee-rules-service');
const oeeDashboardService = require('../../oee/services/oee-dashboard-service');
const { buildHash } = require('../utils/hash-utils');
const { buildUsageExpiresAt, createUsageLog } = require('./ai-usage-service');
const { checkAndConsume } = require('./ai-rate-limit-service');
const openaiClient = require('./openai-client');
const {
  USE_CASES,
  USE_CASE_TTL_DAYS,
} = require('../utils/ai-constants');
const { PROMPT_VERSION, buildDowntimeReasonPrompt } = require('../prompts/downtime-reason');
const AppError = require('../../../utils/app-error');
const machineStatuses = require('../../../constants/machine-statuses');

const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;
const DEFAULT_HISTORY_LIMIT = 20;
const LOOKBACK_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const TELEMETRY_SOURCES = {
  SHIFT_SIM: 'shift-sim',
  DATA_GEN: 'data-gen',
  MOCK_BATCH: 'mock-batch',
};

const normalizeTelemetrySource = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === TELEMETRY_SOURCES.SHIFT_SIM) return TELEMETRY_SOURCES.SHIFT_SIM;
  if (raw === TELEMETRY_SOURCES.MOCK_BATCH) return TELEMETRY_SOURCES.MOCK_BATCH;
  if (raw === TELEMETRY_SOURCES.DATA_GEN) return TELEMETRY_SOURCES.DATA_GEN;
  if (raw === 'simulator') return TELEMETRY_SOURCES.DATA_GEN;
  return TELEMETRY_SOURCES.DATA_GEN;
};

const buildDowntimeSourceFilter = (source) => {
  if (source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return { 'metadata.simulationSource': TELEMETRY_SOURCES.SHIFT_SIM };
  }
  if (source === TELEMETRY_SOURCES.MOCK_BATCH) {
    return { 'metadata.simulationSource': TELEMETRY_SOURCES.MOCK_BATCH };
  }
  if (source === TELEMETRY_SOURCES.DATA_GEN) {
    return {
      $or: [
        { 'metadata.simulationSource': { $exists: false } },
        { 'metadata.simulationSource': TELEMETRY_SOURCES.DATA_GEN },
        { 'metadata.simulationSource': 'simulator' },
      ],
    };
  }
  return {};
};

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

const buildTelemetrySourceFilter = (source) => {
  const effectiveSource = normalizeTelemetrySource(source);
  if (effectiveSource === TELEMETRY_SOURCES.DATA_GEN) {
    return { source: { $in: ['data-gen', 'simulator'] } };
  }
  return { source: effectiveSource };
};

const buildMetricAccumulator = () => ({
  count: 0,
  sum: 0,
  min: null,
  max: null,
  last: null,
});

const toMetricStats = (accumulator) => {
  if (!accumulator || accumulator.count === 0) {
    return { avg: null, min: null, max: null, last: null };
  }
  return {
    avg: Number((accumulator.sum / accumulator.count).toFixed(2)),
    min: accumulator.min,
    max: accumulator.max,
    last: accumulator.last,
  };
};

const pickMetricStats = (stats, { includeMinMax = true, includeLast = true } = {}) => ({
  avg: stats.avg,
  min: includeMinMax ? stats.min : null,
  max: includeMinMax ? stats.max : null,
  last: includeLast ? stats.last : null,
});

const buildTelemetrySummaryForWindow = async ({
  machineId,
  windowStart,
  windowEnd,
  source,
  includeMinMax = true,
  includeLast = true,
}) => {
  const filter = {
    machine: machineId,
    timestamp: { $gte: windowStart, $lte: windowEnd },
    ...buildTelemetrySourceFilter(source),
  };

  const records = await MachineTelemetry.find(filter)
    .sort({ timestamp: 1 })
    .select({ metrics: 1, timestamp: 1 })
    .lean();

  const temperature = buildMetricAccumulator();
  const torque = buildMetricAccumulator();
  const energy = buildMetricAccumulator();

  records.forEach((record) => {
    const metrics = record.metrics || {};
    const temperatureC = metrics.temperatureC;
    const torqueNm = metrics.torqueNm;
    const energyKwh = metrics.energyKwh;

    if (typeof temperatureC === 'number') {
      temperature.count += 1;
      temperature.sum += temperatureC;
      temperature.min = temperature.min === null ? temperatureC : Math.min(temperature.min, temperatureC);
      temperature.max = temperature.max === null ? temperatureC : Math.max(temperature.max, temperatureC);
      temperature.last = temperatureC;
    }

    if (typeof torqueNm === 'number') {
      torque.count += 1;
      torque.sum += torqueNm;
      torque.min = torque.min === null ? torqueNm : Math.min(torque.min, torqueNm);
      torque.max = torque.max === null ? torqueNm : Math.max(torque.max, torqueNm);
      torque.last = torqueNm;
    }

    if (typeof energyKwh === 'number') {
      energy.count += 1;
      energy.sum += energyKwh;
      energy.min = energy.min === null ? energyKwh : Math.min(energy.min, energyKwh);
      energy.max = energy.max === null ? energyKwh : Math.max(energy.max, energyKwh);
      energy.last = energyKwh;
    }
  });

  return {
    windowStart,
    windowEnd,
    sampleCount: records.length,
    temperatureC: pickMetricStats(toMetricStats(temperature), { includeMinMax, includeLast }),
    torqueNm: pickMetricStats(toMetricStats(torque), { includeMinMax, includeLast }),
    energyKwh: pickMetricStats(toMetricStats(energy), { includeMinMax, includeLast }),
  };
};

const formatUserLabel = (user) => {
  if (!user) return null;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.username || user.email || String(user._id);
};

const buildReasonBreakdown = async ({ machineId, source, startedAt }) => {
  const since = new Date(startedAt.getTime() - LOOKBACK_DAYS * DAY_MS);
  const events = await MachineEvent.find({
    machine: machineId,
    state: machineStatuses.DOWNTIME,
    startedAt: { $gte: since },
    endedAt: { $exists: true, $ne: null },
    ...buildDowntimeSourceFilter(source),
  }).lean();

  const catalog = oeeRulesService.getReasonCatalog();
  const reasonMap = new Map(catalog.map((item) => [item.code, item]));

  const counts = new Map();
  events.forEach((event) => {
    const code = event.reasonCode || 'unknown';
    const label = reasonMap.get(code)?.label || 'Bilinmeyen';
    const entry = counts.get(code) || { code, label, count: 0 };
    entry.count += 1;
    counts.set(code, entry);
  });

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const buildHistorySameReason = async ({
  machineId,
  reasonCode,
  source,
  startedAt,
  excludeId,
  limit = DEFAULT_HISTORY_LIMIT,
}) => {
  const since = new Date(startedAt.getTime() - LOOKBACK_DAYS * DAY_MS);
  const events = await MachineEvent.find({
    machine: machineId,
    state: machineStatuses.DOWNTIME,
    reasonCode,
    startedAt: { $gte: since },
    endedAt: { $exists: true, $ne: null },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    ...buildDowntimeSourceFilter(source),
  })
    .sort({ startedAt: -1 })
    .limit(limit)
    .populate({
      path: 'jobOrder',
      select: { assignedOperator: 1 },
      populate: { path: 'assignedOperator', select: { firstName: 1, lastName: 1, username: 1, email: 1 } },
    })
    .lean();

  const items = [];
  for (const event of events) {
    const start = event.startedAt ? new Date(event.startedAt) : startedAt;
    const end = event.endedAt ? new Date(event.endedAt) : start;
    const durationMinutes = Number(((end.getTime() - start.getTime()) / 60000).toFixed(1));
    const telemetrySummary = await buildTelemetrySummaryForWindow({
      machineId,
      windowStart: start,
      windowEnd: end,
      source,
      includeMinMax: true,
      includeLast: true,
    });

    items.push({
      startedAt: start.toISOString(),
      startedAtLabel: start.toISOString(),
      durationMinutes,
      operator: formatUserLabel(event.jobOrder?.assignedOperator),
      telemetrySummary: {
        temperatureC: telemetrySummary.temperatureC,
        torqueNm: telemetrySummary.torqueNm,
        energyKwh: telemetrySummary.energyKwh,
      },
    });
  }

  return items;
};

const generateDowntimeReasonInsight = async ({
  userId,
  downtimeId,
  forceRefresh,
}) => {
  if (!downtimeId) {
    throw new AppError('downtimeId zorunludur.', 400);
  }

  const downtime = await MachineEvent.findById(downtimeId)
    .populate({
      path: 'jobOrder',
      select: { assignedOperator: 1 },
      populate: { path: 'assignedOperator', select: { firstName: 1, lastName: 1, username: 1, email: 1 } },
    })
    .lean();
  if (!downtime) {
    throw new AppError('Duruş bulunamadı.', 404);
  }

  if (downtime.state !== machineStatuses.DOWNTIME) {
    throw new AppError('Sadece downtime kayitlari icin analiz yapilabilir.', 400);
  }

  if (!downtime.endedAt) {
    return { skipped: true, reason: 'open_downtime', insight: null };
  }

  if (!downtime.reasonCode || downtime.reasonCode === 'unplanned_stop') {
    return { skipped: true, reason: 'missing_reason', insight: null };
  }

  const source = normalizeTelemetrySource(downtime.metadata?.simulationSource || downtime.source);
  const endAt = new Date(downtime.endedAt);
  const startedAt = downtime.startedAt ? new Date(downtime.startedAt) : endAt;
  const durationMinutes = Number(((endAt.getTime() - startedAt.getTime()) / 60000).toFixed(1));
  const telemetryWindowMs = oeeDashboardService.telemetryWindowMs || 10 * 60 * 1000;
  const telemetryBefore = await buildTelemetrySummaryForWindow({
    machineId: downtime.machine,
    windowStart: new Date(startedAt.getTime() - telemetryWindowMs),
    windowEnd: startedAt,
    source,
    includeMinMax: false,
    includeLast: true,
  });
  const telemetryDuring = await buildTelemetrySummaryForWindow({
    machineId: downtime.machine,
    windowStart: startedAt,
    windowEnd: endAt,
    source,
    includeMinMax: true,
    includeLast: true,
  });
  const historySameReason = await buildHistorySameReason({
    machineId: downtime.machine,
    reasonCode: downtime.reasonCode,
    source,
    startedAt,
    excludeId: downtime._id,
  });
  const reasonBreakdown = await buildReasonBreakdown({
    machineId: downtime.machine,
    source,
    startedAt,
  });
  const assignedOperator = formatUserLabel(downtime.jobOrder?.assignedOperator);

  const dataSnapshotHash = buildHash({
    downtimeId: String(downtimeId),
    durationMinutes,
    currentReason: downtime.reasonCode,
    telemetrySummary: {
      before: {
        temperatureC: telemetryBefore.temperatureC,
        torqueNm: telemetryBefore.torqueNm,
        energyKwh: telemetryBefore.energyKwh,
      },
      during: {
        temperatureC: telemetryDuring.temperatureC,
        torqueNm: telemetryDuring.torqueNm,
        energyKwh: telemetryDuring.energyKwh,
      },
    },
  });

  const windowKey = `downtime|${downtimeId}`;
  const cacheTtlMs = getCacheTtlMs();
  const now = new Date();

  if (!forceRefresh) {
    const cached = await AiInsight.findOne({
      createdBy: userId,
      useCase: USE_CASES.DOWNTIME_REASON,
      downtimeId,
      dataSnapshotHash,
    })
      .sort({ generatedAt: -1 })
      .lean();

    if (cached && now.getTime() - new Date(cached.generatedAt).getTime() <= cacheTtlMs) {
      await createUsageLog({
        createdBy: userId,
        useCase: USE_CASES.DOWNTIME_REASON,
        source,
        machineId: downtime.machine,
        downtimeId,
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
        expiresAt: buildUsageExpiresAt(now),
      });

      return { insight: cached, cacheHit: true, rateLimitMeta: null };
    }
  }

  const rateLimit = checkAndConsume({
    userId,
    useCase: USE_CASES.DOWNTIME_REASON,
    estimatedCostUsd: 0.0003,
    consume: true,
  });

  if (!rateLimit.allowed) {
    await createUsageLog({
      createdBy: userId,
      useCase: USE_CASES.DOWNTIME_REASON,
      source,
      machineId: downtime.machine,
      downtimeId,
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

  const machine = await Machine.findById(downtime.machine).select({ code: 1, name: 1 }).lean();
  const machineName = machine?.name || machine?.code || String(downtime.machine);

  const prompt = buildDowntimeReasonPrompt({
    machineName,
    startedAt: startedAt.toISOString(),
    endedAt: endAt.toISOString(),
    durationMinutes,
    currentReason: downtime.reasonCode,
    assignedOperator,
    telemetryBefore,
    telemetryDuring,
    historySameReason,
    reasonBreakdown,
  });

  const startedAtMs = Date.now();
  const response = await openaiClient.requestResponse({
    input: prompt,
    max_output_tokens: 450,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - startedAtMs;

  const outputText = response.output_text || response.output?.[0]?.content?.[0]?.text || '';
  const parsedOutput = parseJsonFromText(outputText) || {};
  const summary = typeof parsedOutput.summary === 'string' ? parsedOutput.summary : '';
  const patterns = Array.isArray(parsedOutput.patterns) ? parsedOutput.patterns : [];
  const actions = Array.isArray(parsedOutput.actions) ? parsedOutput.actions : [];
  const warnings = Array.isArray(parsedOutput.warnings) ? parsedOutput.warnings : [];

  const expiresAt = computeExpiresAt(USE_CASES.DOWNTIME_REASON, now);

  const insightDoc = await AiInsight.create({
    useCase: USE_CASES.DOWNTIME_REASON,
    createdBy: userId,
    machineId: downtime.machine,
    downtimeId,
    source,
    windowKey,
    dataSnapshotHash,
    hashVersion: 1,
    promptVersion: PROMPT_VERSION,
    provider: 'openai',
    model: openaiClient.getConfig().model,
    normalizedInput: {
      downtimeId,
      machineId: downtime.machine,
      durationMinutes,
      currentReason: downtime.reasonCode,
      reasonCategory: downtime.reasonCategory || null,
      assignedOperator,
      telemetryBefore,
      telemetryDuring,
      historySameReason,
      reasonBreakdown,
    },
    output: {
      summary,
      patterns,
      highlights: patterns,
      actions,
      warnings,
    },
    tokenUsage: response.usage || null,
    generatedAt: now,
    expiresAt,
  });

  const tokensIn = response.usage?.input_tokens || response.usage?.prompt_tokens || 0;
  const tokensOut = response.usage?.output_tokens || response.usage?.completion_tokens || 0;
  const tokensTotal = response.usage?.total_tokens || tokensIn + tokensOut;

  await createUsageLog({
    createdBy: userId,
    useCase: USE_CASES.DOWNTIME_REASON,
    source,
    machineId: downtime.machine,
    downtimeId,
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
  generateDowntimeReasonInsight,
};
