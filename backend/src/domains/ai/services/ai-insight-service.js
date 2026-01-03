const AiInsight = require('../models/ai-insight-model');
const oeeCalculatorService = require('../../oee/services/oee-calculator-service');
const { buildWindowKey, toWindowPayload } = require('../utils/window-utils');
const { buildLossBreakdown } = require('./loss-breakdown-service');
const { buildOeeSnapshotHash } = require('../utils/oee-hash-utils');
const { USE_CASES } = require('../utils/ai-constants');

const buildWindowFromQuery = ({ mode, shiftDate, from, to, timezone }) => {
  if (!mode) return null;
  if (mode === 'shift') {
    if (!shiftDate) return null;
    return toWindowPayload({
      mode: 'shift',
      shiftDateYmd: shiftDate,
      timezone,
    });
  }
  if (mode === 'range') {
    const fromMs = from ? new Date(from).getTime() : NaN;
    const toMs = to ? new Date(to).getTime() : NaN;
    if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return null;
    return toWindowPayload({
      mode: 'range',
      fromMs,
      toMs,
      timezone,
    });
  }
  return null;
};

const listInsights = async ({ userId, useCase, machineId, downtimeId, source, limit = 20 } = {}) => {
  const query = { createdBy: userId };
  if (useCase) query.useCase = useCase;
  if (machineId) query.machineId = machineId;
  if (downtimeId) query.downtimeId = downtimeId;
  if (source) query.source = source;

  const cappedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return AiInsight.find(query)
    .sort({ generatedAt: -1 })
    .limit(cappedLimit)
    .lean();
};

const getInsightById = async (id, userId) => {
  return AiInsight.findOne({ _id: id, createdBy: userId }).lean();
};

const buildRangeFromWindow = (window) => {
  if (!window) return {};
  if (window.mode === 'range') {
    return {
      from: window.fromMs ? new Date(window.fromMs).toISOString() : undefined,
      to: window.toMs ? new Date(window.toMs).toISOString() : undefined,
    };
  }
  return {};
};

const resolveShiftDate = ({ shiftDate, window }) => {
  if (shiftDate) return shiftDate;
  if (window?.shiftDateYmd) return window.shiftDateYmd;
  return null;
};

const getLatestInsight = async ({
  userId,
  useCase,
  machineId,
  downtimeId,
  source,
  mode,
  shiftDate,
  from,
  to,
  timezone,
  checkStale,
} = {}) => {
  const query = { createdBy: userId };
  if (useCase) query.useCase = useCase;
  if (machineId) query.machineId = machineId;
  if (downtimeId) query.downtimeId = downtimeId;
  if (source) query.source = source;

  const window = buildWindowFromQuery({ mode, shiftDate, from, to, timezone });
  const windowKey = window ? buildWindowKey(window) : null;
  if (windowKey) query.windowKey = windowKey;

  const insight = await AiInsight.findOne(query).sort({ generatedAt: -1 }).lean();
  if (!insight || !checkStale) {
    return insight;
  }

  if (insight.useCase !== USE_CASES.OEE_INSIGHT) {
    return { ...insight, isStale: false };
  }

  const resolvedMode = mode || insight.window?.mode;
  if (!resolvedMode) {
    return { ...insight, isStale: false };
  }

  try {
    const resolvedShiftDate = resolveShiftDate({ shiftDate, window: insight.window });
    const rangeOverrides = buildRangeFromWindow(insight.window);
    const stats = await oeeCalculatorService.calculateOeeForMachine({
      machineId: insight.machineId,
      mode: resolvedMode,
      shiftDate: resolvedMode === 'shift' ? resolvedShiftDate : undefined,
      from: resolvedMode === 'range' ? (from || rangeOverrides.from) : undefined,
      to: resolvedMode === 'range' ? (to || rangeOverrides.to) : undefined,
      source: insight.source,
    });

    const windowStart = stats.windowStart ? new Date(stats.windowStart) : null;
    const windowEnd = stats.windowEnd ? new Date(stats.windowEnd) : null;
    if (!windowStart || !windowEnd) {
      return { ...insight, isStale: false };
    }

    const lossBreakdown = await buildLossBreakdown({
      machineId: insight.machineId,
      source: stats.source,
      mode: stats.mode,
      shiftDateYmd: resolvedShiftDate,
      windowStart,
      windowEnd,
    });

    const currentHash = buildOeeSnapshotHash({ stats, lossBreakdown });
    return { ...insight, isStale: currentHash !== insight.dataSnapshotHash };
  } catch (error) {
    return { ...insight, isStale: false };
  }
};

module.exports = {
  listInsights,
  getLatestInsight,
  getInsightById,
  buildWindowFromQuery,
};
