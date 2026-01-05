const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const ProductionEvent = require('../../production/models/production-event-model');
const Machine = require('../../machines/models/machine-model');
const AiInsight = require('../models/ai-insight-model');
const oeeDashboardService = require('../../oee/services/oee-dashboard-service');
const { buildHash } = require('../utils/hash-utils');
const { buildWindowKey, toWindowPayload } = require('../utils/window-utils');
const { buildUsageExpiresAt, createUsageLog } = require('./ai-usage-service');
const { checkAndConsume } = require('./ai-rate-limit-service');
const openaiClient = require('./openai-client');
const { PROMPT_VERSION, buildAnomalyRiskPrompt } = require('../prompts/anomaly-risk');
const { USE_CASES, USE_CASE_TTL_DAYS } = require('../utils/ai-constants');
const AppError = require('../../../utils/app-error');

const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;
const BASELINE_TTL_MS = 60 * 60 * 1000;
const BASELINE_SAMPLE_SIZE = 500;
const Z_THRESHOLD = 2.5;
const Z_STRONG_THRESHOLD = 3.5;
const QUALITY_LOOKBACK_DAYS = 7;
const DEFAULT_TIMEZONE = 'Europe/Istanbul';

const TELEMETRY_SOURCES = {
  SHIFT_SIM: 'shift-sim',
  DATA_GEN: 'data-gen',
  MOCK_BATCH: 'mock-batch',
};

const LEGACY_DATA_GEN_SOURCES = ['data-gen', 'simulator'];

const baselineCache = new Map();

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

const normalizeTelemetrySource = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw || raw === 'auto') return 'auto';
  if (raw === TELEMETRY_SOURCES.SHIFT_SIM) return TELEMETRY_SOURCES.SHIFT_SIM;
  if (raw === TELEMETRY_SOURCES.MOCK_BATCH) return TELEMETRY_SOURCES.MOCK_BATCH;
  if (raw === TELEMETRY_SOURCES.DATA_GEN) return TELEMETRY_SOURCES.DATA_GEN;
  if (raw === 'simulator') return TELEMETRY_SOURCES.DATA_GEN;
  return 'auto';
};

const resolveAutoSource = async (machineId) => {
  const latest = await MachineTelemetry.findOne({
    machine: machineId,
    source: { $ne: 'seed' },
  })
    .sort({ _id: -1 })
    .select({ source: 1 })
    .lean();

  if (latest?.source === TELEMETRY_SOURCES.MOCK_BATCH) {
    return TELEMETRY_SOURCES.MOCK_BATCH;
  }
  if (latest?.source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return TELEMETRY_SOURCES.SHIFT_SIM;
  }
  return TELEMETRY_SOURCES.DATA_GEN;
};

const buildTelemetrySourceFilter = (source) => {
  if (source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return { source: TELEMETRY_SOURCES.SHIFT_SIM };
  }
  if (source === TELEMETRY_SOURCES.MOCK_BATCH) {
    return { source: TELEMETRY_SOURCES.MOCK_BATCH };
  }
  return { source: { $in: LEGACY_DATA_GEN_SOURCES } };
};

const buildProductionSourceFilter = (source) => {
  if (source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return { 'metadata.simulationSource': TELEMETRY_SOURCES.SHIFT_SIM };
  }
  if (source === TELEMETRY_SOURCES.MOCK_BATCH) {
    return { 'metadata.simulationSource': TELEMETRY_SOURCES.MOCK_BATCH };
  }
  return {
    $or: [
      { 'metadata.simulationSource': { $exists: false } },
      { 'metadata.simulationSource': TELEMETRY_SOURCES.DATA_GEN },
      { 'metadata.simulationSource': 'simulator' },
    ],
  };
};

const buildAccumulator = () => ({
  count: 0,
  sum: 0,
  sumSq: 0,
});

const updateAccumulator = (accumulator, value) => {
  accumulator.count += 1;
  accumulator.sum += value;
  accumulator.sumSq += value * value;
};

const toBaselineStats = (accumulator) => {
  if (!accumulator || accumulator.count === 0) {
    return { mean: null, std: null };
  }
  const mean = accumulator.sum / accumulator.count;
  const variance = Math.max(accumulator.sumSq / accumulator.count - mean * mean, 0);
  const std = Math.sqrt(variance);
  return {
    mean: Number(mean.toFixed(4)),
    std: Number(std.toFixed(4)),
  };
};

const computeBaseline = (records) => {
  const temperature = buildAccumulator();
  const torque = buildAccumulator();
  const energy = buildAccumulator();

  records.forEach((record) => {
    const metrics = record.metrics || {};
    const temperatureC = metrics.temperatureC;
    const torqueNm = metrics.torqueNm;
    const energyKwh = metrics.energyKwh;

    if (typeof temperatureC === 'number') {
      updateAccumulator(temperature, temperatureC);
    }
    if (typeof torqueNm === 'number') {
      updateAccumulator(torque, torqueNm);
    }
    if (typeof energyKwh === 'number') {
      updateAccumulator(energy, energyKwh);
    }
  });

  return {
    temperatureC: toBaselineStats(temperature),
    torqueNm: toBaselineStats(torque),
    energyKwh: toBaselineStats(energy),
    sampleCount: records.length,
  };
};

const getBaselineStats = async ({ machineId, source }) => {
  const cacheKey = `${machineId}:${source}`;
  const cached = baselineCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached;
  }

  const records = await MachineTelemetry.find({
    machine: machineId,
    signalValue: 1,
    ...buildTelemetrySourceFilter(source),
  })
    .sort({ timestamp: -1 })
    .limit(BASELINE_SAMPLE_SIZE)
    .select({ metrics: 1, timestamp: 1 })
    .lean();

  const baseline = computeBaseline(records);
  const entry = {
    ...baseline,
    latestTelemetry: records[0] || null,
    createdAt: now,
    expiresAt: now + BASELINE_TTL_MS,
  };

  baselineCache.set(cacheKey, entry);
  return entry;
};

const buildMetricSnapshot = (value, baseline) => {
  if (typeof value !== 'number' || !baseline || baseline.std === null || baseline.std === 0) {
    return { value: value ?? null, mean: baseline?.mean ?? null, std: baseline?.std ?? null, zScore: null };
  }
  const zScore = (value - baseline.mean) / baseline.std;
  return {
    value: Number(value.toFixed(2)),
    mean: Number(baseline.mean.toFixed(2)),
    std: Number(baseline.std.toFixed(2)),
    zScore: Number(zScore.toFixed(2)),
  };
};

const evaluateRisk = (metricsSnapshot) => {
  const entries = Object.entries(metricsSnapshot || {}).map(([metric, stats]) => ({
    metric,
    zScore: stats?.zScore ?? null,
    value: stats?.value ?? null,
    baselineMean: stats?.mean ?? null,
    baselineStd: stats?.std ?? null,
  }));

  const strong = entries.filter((item) => typeof item.zScore === 'number' && item.zScore >= Z_STRONG_THRESHOLD);
  const moderate = entries.filter((item) => typeof item.zScore === 'number' && item.zScore >= Z_THRESHOLD);

  if (strong.length > 0) {
    return { riskLevel: 'high', affectedMetrics: strong };
  }
  if (moderate.length >= 2) {
    return { riskLevel: 'medium', affectedMetrics: moderate.slice(0, 2) };
  }
  return { riskLevel: null, affectedMetrics: [] };
};

const buildQualitySummary = async ({ machineId, source, windowEnd }) => {
  const since = new Date(windowEnd.getTime() - QUALITY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const match = {
    machine: machineId,
    timestamp: { $gte: since, $lte: windowEnd },
    qualityStatus: { $in: ['good', 'defective'] },
    ...buildProductionSourceFilter(source),
  };

  const rows = await ProductionEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$qualityStatus',
        total: { $sum: '$quantity' },
      },
    },
  ]);

  const goodCount = rows.find((row) => row._id === 'good')?.total || 0;
  const defectCount = rows.find((row) => row._id === 'defective')?.total || 0;
  const total = goodCount + defectCount;
  if (!total) return null;
  const defectRatePercent = Number(((defectCount / total) * 100).toFixed(1));
  return {
    goodCount,
    defectCount,
    defectRatePercent,
  };
};

const generateAnomalyRiskInsight = async ({
  userId,
  machineId,
  source,
  timezone,
  forceRefresh,
}) => {
  if (!machineId) {
    throw new AppError('machineId zorunludur.', 400);
  }

  const normalizedSource = normalizeTelemetrySource(source);
  const effectiveSource =
    normalizedSource === 'auto' ? await resolveAutoSource(machineId) : normalizedSource;

  if (effectiveSource === TELEMETRY_SOURCES.MOCK_BATCH) {
    return { skipped: true, reason: 'mock_batch_disabled', insight: null };
  }

  const baseline = await getBaselineStats({ machineId, source: effectiveSource });
  const latestTelemetry = baseline.latestTelemetry;
  if (!latestTelemetry) {
    return { skipped: true, reason: 'no_telemetry', insight: null };
  }

  const metrics = latestTelemetry.metrics || {};
  const metricsSnapshot = {
    temperatureC: buildMetricSnapshot(metrics.temperatureC, baseline.temperatureC),
    torqueNm: buildMetricSnapshot(metrics.torqueNm, baseline.torqueNm),
    energyKwh: buildMetricSnapshot(metrics.energyKwh, baseline.energyKwh),
  };

  const { riskLevel, affectedMetrics } = evaluateRisk(metricsSnapshot);
  if (!riskLevel) {
    return { skipped: true, reason: 'no_anomaly', insight: null };
  }

  const telemetryWindowMs = oeeDashboardService.telemetryWindowMs || 10 * 60 * 1000;
  const windowEnd = new Date(latestTelemetry.timestamp);
  const windowStart = new Date(windowEnd.getTime() - telemetryWindowMs);
  const window = toWindowPayload({
    mode: 'range',
    fromMs: windowStart.getTime(),
    toMs: windowEnd.getTime(),
    timezone: timezone || DEFAULT_TIMEZONE,
  });
  const windowKey = buildWindowKey(window);
  if (!windowKey) {
    throw new AppError('WindowKey olusturulamadi.', 400);
  }

  const dataSnapshotHash = buildHash({
    machineId: String(machineId),
    riskLevel,
    affectedMetrics: affectedMetrics.map((item) => ({
      metric: item.metric,
      zScore: item.zScore,
      value: item.value,
    })),
  });

  const cacheTtlMs = getCacheTtlMs();
  const now = new Date();

  if (!forceRefresh) {
    const cached = await AiInsight.findOne({
      createdBy: userId,
      useCase: USE_CASES.ANOMALY_RISK,
      machineId,
      source: effectiveSource,
      windowKey,
      dataSnapshotHash,
    })
      .sort({ generatedAt: -1 })
      .lean();

    if (cached && now.getTime() - new Date(cached.generatedAt).getTime() <= cacheTtlMs) {
      await createUsageLog({
        createdBy: userId,
        useCase: USE_CASES.ANOMALY_RISK,
        source: effectiveSource,
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
        expiresAt: buildUsageExpiresAt(now),
      });

      return { insight: cached, cacheHit: true, rateLimitMeta: null };
    }
  }

  const rateLimit = checkAndConsume({
    userId,
    useCase: USE_CASES.ANOMALY_RISK,
    estimatedCostUsd: 0.0007,
    consume: true,
  });

  if (!rateLimit.allowed) {
    await createUsageLog({
      createdBy: userId,
      useCase: USE_CASES.ANOMALY_RISK,
      source: effectiveSource,
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
  const machineName = machine?.name || machine?.code || String(machineId);
  const qualitySummary = await buildQualitySummary({
    machineId,
    source: effectiveSource,
    windowEnd,
  });

  const prompt = buildAnomalyRiskPrompt({
    machineName,
    source: effectiveSource,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    metricsSnapshot,
    affectedMetrics,
    baselineSampleCount: baseline.sampleCount,
    qualitySummary,
  });

  const startedAt = Date.now();
  const response = await openaiClient.requestResponse({
    input: prompt,
    max_output_tokens: 450,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - startedAt;

  const outputText = response.output_text || response.output?.[0]?.content?.[0]?.text || '';
  const parsedOutput = parseJsonFromText(outputText) || {};
  const summary = typeof parsedOutput.summary === 'string' ? parsedOutput.summary : '';
  const outputRisk = typeof parsedOutput.riskLevel === 'string' ? parsedOutput.riskLevel : riskLevel;
  const outputMetrics = Array.isArray(parsedOutput.affectedMetrics)
    ? parsedOutput.affectedMetrics
    : affectedMetrics.map((item) => ({
        metric: item.metric,
        value: item.value,
        zScore: item.zScore,
        baselineMean: item.baselineMean,
        baselineStd: item.baselineStd,
      }));
  const actions = Array.isArray(parsedOutput.actions) ? parsedOutput.actions : [];
  const warnings = Array.isArray(parsedOutput.warnings) ? parsedOutput.warnings : [];
  const qualityNote = typeof parsedOutput.qualityNote === 'string' ? parsedOutput.qualityNote : null;

  const expiresAt = computeExpiresAt(USE_CASES.ANOMALY_RISK, now);

  const insightDoc = await AiInsight.create({
    useCase: USE_CASES.ANOMALY_RISK,
    createdBy: userId,
    machineId,
    source: effectiveSource,
    window,
    windowKey,
    dataSnapshotHash,
    hashVersion: 1,
    promptVersion: PROMPT_VERSION,
    provider: 'openai',
    model: openaiClient.getConfig().model,
    normalizedInput: {
      window,
      baseline: {
        sampleCount: baseline.sampleCount,
        temperatureC: baseline.temperatureC,
        torqueNm: baseline.torqueNm,
        energyKwh: baseline.energyKwh,
      },
      metricsSnapshot,
      riskLevel,
      affectedMetrics,
      qualitySummary,
    },
    output: {
      summary,
      riskLevel: outputRisk,
      affectedMetrics: outputMetrics,
      actions,
      warnings,
      qualityNote,
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
    useCase: USE_CASES.ANOMALY_RISK,
    source: effectiveSource,
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
  generateAnomalyRiskInsight,
};
