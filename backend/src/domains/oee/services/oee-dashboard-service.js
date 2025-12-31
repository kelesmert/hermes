const path = require('path');
const fs = require('fs');
const Machine = require('../../machines/models/machine-model');
const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const MachineEvent = require('../../machines/models/machine-event-model');
const OeeMachineState = require('../models/oee-machine-state-model');
const machineStatuses = require('../../../constants/machine-statuses');
const AppError = require('../../../utils/app-error');
const simulationClockService = require('../../simulations/services/simulation-clock-service');

const CONFIG_PATH = path.join(__dirname, '../config/oee-rules.json');

const loadAggregationRules = () => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.aggregation || {};
  } catch (error) {
    console.error('OEE konfigürasyonu okunamadı, varsayılan değerler kullanılacak.', error.message);
    return {};
  }
};

const aggregationRules = loadAggregationRules();
const telemetryWindowMs = aggregationRules.telemetryWindowMs || 10 * 60 * 1000; // 10 dk varsayılan

const TELEMETRY_SOURCES = {
  SHIFT_SIM: 'shift-sim',
  DATA_GEN: 'data-gen',
};

const LEGACY_DATA_GEN_SOURCES = ['data-gen', 'simulator'];

const normalizeTelemetrySource = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw || raw === 'auto') return 'auto';
  if (raw === TELEMETRY_SOURCES.SHIFT_SIM) return TELEMETRY_SOURCES.SHIFT_SIM;
  if (raw === TELEMETRY_SOURCES.DATA_GEN) return TELEMETRY_SOURCES.DATA_GEN;
  if (raw === 'simulator') return TELEMETRY_SOURCES.DATA_GEN; // legacy data-gen
  return 'auto';
};

const normalizeView = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw || raw === 'auto') return 'auto';
  if (raw === 'shift') return 'shift';
  if (raw === 'live') return 'live';
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

  if (latest?.source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return TELEMETRY_SOURCES.SHIFT_SIM;
  }
  return TELEMETRY_SOURCES.DATA_GEN;
};

const normalizeBucketMinutes = (value, fallback = 15) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Math.round(numeric), 5), 60);
};

const resolveEffectiveNow = async (filter = {}) => {
  const now = new Date();
  const latest = await MachineTelemetry.findOne(filter)
    .sort({ timestamp: -1 })
    .select({ timestamp: 1 })
    .lean();

  if (latest?.timestamp && latest.timestamp.getTime() > now.getTime()) {
    return latest.timestamp;
  }

  return now;
};

const getMachineShiftTelemetrySeries = async (
  machine,
  { bucketMinutes, source, simulationRunId, shiftStartAt, shiftEndAt } = {},
) => {
  const effectiveBucketMinutes = normalizeBucketMinutes(bucketMinutes, 15);
  const bucketMs = effectiveBucketMinutes * 60 * 1000;
  const signalLongStopThresholdMs = 5 * 60 * 1000;

  const normalizedSource = normalizeTelemetrySource(source);
  let effectiveSource = normalizedSource;
  let effectiveRunId = simulationRunId || null;
  let effectiveShiftStartAt = shiftStartAt || null;
  let effectiveShiftEndAt = shiftEndAt || null;

  if (!effectiveShiftStartAt || !effectiveShiftEndAt) {
    const shiftSimReference = await MachineTelemetry.findOne({
      machine: machine._id,
      source: TELEMETRY_SOURCES.SHIFT_SIM,
      ...(effectiveRunId && { simulationRunId: effectiveRunId }),
    })
      .sort({ timestamp: -1 })
      .select({ timestamp: 1, source: 1, simulationRunId: 1 })
      .lean();

    const latestTelemetry =
      shiftSimReference ||
      (await MachineTelemetry.findOne({
        machine: machine._id,
        source: { $ne: 'seed' },
      })
        .sort({ timestamp: -1 })
        .select({ timestamp: 1, source: 1, simulationRunId: 1 })
        .lean());

    const referenceDate = latestTelemetry?.timestamp || new Date();
    const window = await simulationClockService.getShiftWindowForDate(referenceDate, {
      includeWeekends: true,
    });
    if (window) {
      effectiveShiftStartAt = window.shiftStartAt;
      effectiveShiftEndAt = window.shiftEndAt;
    }

    if (latestTelemetry?.source === TELEMETRY_SOURCES.SHIFT_SIM) {
      effectiveSource = TELEMETRY_SOURCES.SHIFT_SIM;
      effectiveRunId = latestTelemetry.simulationRunId || effectiveRunId;
    } else if (effectiveSource === 'auto') {
      effectiveSource = TELEMETRY_SOURCES.DATA_GEN;
    }
  }

  const match = {
    machine: machine._id,
    timestamp: { $gte: effectiveShiftStartAt, $lt: effectiveShiftEndAt },
    source: { $ne: 'seed' },
  };

  if (effectiveSource === TELEMETRY_SOURCES.SHIFT_SIM) {
    match.source = TELEMETRY_SOURCES.SHIFT_SIM;
    if (effectiveRunId) {
      match.simulationRunId = effectiveRunId;
    }
  } else if (effectiveSource === TELEMETRY_SOURCES.DATA_GEN) {
    match.source = { $in: LEGACY_DATA_GEN_SOURCES };
  }

  const [bucketAgg, latestInWindow] = await Promise.all([
    MachineTelemetry.aggregate([
      { $match: match },
      { $sort: { timestamp: 1 } },
      {
        $project: {
          timestamp: 1,
        signalValue: 1,
        metrics: 1,
        intervalMs: { $ifNull: ['$intervalMs', 2000] },
        offsetMs: { $subtract: ['$timestamp', effectiveShiftStartAt] },
      },
    },
    {
      $addFields: {
        bucketIndex: { $floor: { $divide: ['$offsetMs', bucketMs] } },
      },
    },
    {
      $group: {
        _id: '$bucketIndex',
        avgTemperatureC: { $avg: '$metrics.temperatureC' },
        avgTorqueNm: { $avg: '$metrics.torqueNm' },
        avgEnergyKwh: { $avg: '$metrics.energyKwh' },
        onMs: {
          $sum: {
            $cond: [{ $eq: ['$signalValue', 1] }, '$intervalMs', 0],
          },
        },
        offMs: {
          $sum: {
            $cond: [{ $eq: ['$signalValue', 0] }, '$intervalMs', 0],
          },
        },
        signalSamples: {
          $push: {
            signalValue: '$signalValue',
            intervalMs: '$intervalMs',
          },
        },
        samples: { $sum: 1 },
        lastAt: { $max: '$timestamp' },
      },
    },
    {
      $addFields: {
        maxConsecutiveOffMs: {
          $let: {
            vars: {
              reduced: {
                $reduce: {
                  input: '$signalSamples',
                  initialValue: { current: 0, max: 0 },
                  in: {
                    $cond: [
                      { $eq: ['$$this.signalValue', 0] },
                      {
                        current: { $add: ['$$value.current', '$$this.intervalMs'] },
                        max: {
                          $max: ['$$value.max', { $add: ['$$value.current', '$$this.intervalMs'] }],
                        },
                      },
                      { current: 0, max: '$$value.max' },
                    ],
                  },
                },
              },
            },
            in: '$$reduced.max',
          },
        },
      },
    },
    { $project: { signalSamples: 0 } },
    { $sort: { _id: 1 } },
    ]),
    MachineTelemetry.findOne(match)
      .sort({ timestamp: -1 })
      .select({ timestamp: 1, source: 1, simulationRunId: 1 })
      .lean(),
  ]);

  const shiftDurationMs = effectiveShiftEndAt.getTime() - effectiveShiftStartAt.getTime();
  const bucketCount = Math.ceil(shiftDurationMs / bucketMs);
  const bucketMap = new Map(bucketAgg.map((row) => [Number(row._id), row]));

  const series = [];
  for (let bucketIndex = 0; bucketIndex < bucketCount; bucketIndex += 1) {
    const bucketStart = new Date(effectiveShiftStartAt.getTime() + bucketIndex * bucketMs);
    const row = bucketMap.get(bucketIndex);
    if (!row) {
      series.push({
        timestamp: bucketStart,
        signalValue: null,
        metrics: { temperatureC: null, torqueNm: null, energyKwh: null },
        samples: 0,
        onMs: 0,
        offMs: 0,
        bucketIndex,
      });
      continue;
    }

    const onMs = Number(row.onMs) || 0;
    const offMs = Number(row.offMs) || 0;
    const totalMs = onMs + offMs;
    const maxConsecutiveOffMs = Number(row.maxConsecutiveOffMs) || 0;
    series.push({
      timestamp: bucketStart,
      signalValue:
        totalMs > 0 ? (maxConsecutiveOffMs >= signalLongStopThresholdMs ? 0 : 1) : null,
      metrics: {
        temperatureC: row.avgTemperatureC ?? null,
        torqueNm: row.avgTorqueNm ?? null,
        energyKwh: row.avgEnergyKwh ?? null,
      },
      samples: Number(row.samples) || 0,
      onMs,
      offMs,
      bucketIndex,
    });
  }

  return {
    view: 'shift',
    bucketMinutes: effectiveBucketMinutes,
    shiftStartAt: effectiveShiftStartAt,
    shiftEndAt: effectiveShiftEndAt,
    series,
    windowStart: effectiveShiftStartAt,
    windowEnd: effectiveShiftEndAt,
    latestAt: latestInWindow?.timestamp || null,
    simulationRunId: effectiveRunId || latestInWindow?.simulationRunId || null,
    source: effectiveSource === 'auto' ? null : effectiveSource,
  };
};

const getMachineCounts = async () => {
  const [totalMachines, runningMachines, downtimeMachines] = await Promise.all([
    Machine.countDocuments(),
    Machine.countDocuments({ status: machineStatuses.RUNNING }),
    Machine.countDocuments({ status: machineStatuses.DOWNTIME }),
  ]);

  const idleMachines = Math.max(totalMachines - runningMachines - downtimeMachines, 0);

  return {
    totalMachines,
    runningMachines,
    downtimeMachines,
    idleMachines,
  };
};

const getTelemetryMetrics = async () => {
  const effectiveNow = await resolveEffectiveNow();
  const windowStart = new Date(effectiveNow.getTime() - telemetryWindowMs);
  const telemetryAgg = await MachineTelemetry.aggregate([
    { $match: { timestamp: { $gte: windowStart, $lte: effectiveNow } } },
    {
      $group: {
        _id: null,
        avgTemperatureC: { $avg: '$metrics.temperatureC' },
        avgTorqueNm: { $avg: '$metrics.torqueNm' },
        avgEnergyKwh: { $avg: '$metrics.energyKwh' },
        lastSampleAt: { $max: '$timestamp' },
      },
    },
  ]);

  if (!telemetryAgg.length) {
    return {
      avgTemperatureC: null,
      avgTorqueNm: null,
      avgEnergyKwh: null,
      lastSampleAt: null,
    };
  }

  const [result] = telemetryAgg;
  return {
    avgTemperatureC: result.avgTemperatureC ?? null,
    avgTorqueNm: result.avgTorqueNm ?? null,
    avgEnergyKwh: result.avgEnergyKwh ?? null,
    lastSampleAt: result.lastSampleAt || null,
  };
};

const getDowntimeSummary = async () => {
  const now = await resolveEffectiveNow();
  const windowStart = new Date(now.getTime() - telemetryWindowMs);

  const downtimeAgg = await MachineEvent.aggregate([
    {
      $match: {
        state: machineStatuses.DOWNTIME,
        startedAt: { $lt: now },
        $or: [{ endedAt: { $exists: false } }, { endedAt: { $gt: windowStart } }],
      },
    },
    {
      $addFields: {
        effectiveStart: {
          $cond: [{ $gt: ['$startedAt', windowStart] }, '$startedAt', windowStart],
        },
        effectiveEnd: {
          $cond: [
            { $ifNull: ['$endedAt', false] },
            {
              $cond: [{ $lt: ['$endedAt', now] }, '$endedAt', now],
            },
            now,
          ],
        },
      },
    },
    {
      $project: {
        durationMs: {
          $max: [
            {
              $subtract: ['$effectiveEnd', '$effectiveStart'],
            },
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalDowntimeMs: { $sum: '$durationMs' },
      },
    },
  ]);

  const totalDowntimeMs = downtimeAgg.length ? downtimeAgg[0].totalDowntimeMs : 0;

  return {
    windowStart,
    windowEnd: now,
    totalDowntimeMs,
  };
};

const getGlobalMetrics = async () => {
  const [counts, telemetryMetrics, downtimeSummary] = await Promise.all([
    getMachineCounts(),
    getTelemetryMetrics(),
    getDowntimeSummary(),
  ]);

  return {
    counts,
    telemetry: telemetryMetrics,
    downtime: downtimeSummary,
    telemetryWindowMs,
  };
};

const getMachineTelemetrySummary = async (machineId, { source } = {}) => {
  const machine = await Machine.findById(machineId);
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }

  const requestedSource = normalizeTelemetrySource(source);
  const effectiveSource =
    requestedSource === 'auto' ? await resolveAutoSource(machine._id) : requestedSource;

  const sourceFilter =
    effectiveSource === TELEMETRY_SOURCES.SHIFT_SIM
      ? { source: TELEMETRY_SOURCES.SHIFT_SIM }
      : { source: { $in: LEGACY_DATA_GEN_SOURCES } };

  const latestTelemetry = await MachineTelemetry.findOne({
    machine: machine._id,
    ...sourceFilter,
  })
    .sort({ timestamp: -1 })
    .select({ timestamp: 1, signalValue: 1, simulationRunId: 1 })
    .lean();

  const effectiveNow =
    effectiveSource === TELEMETRY_SOURCES.DATA_GEN ? new Date() : latestTelemetry?.timestamp || new Date();
  const windowStart = new Date(effectiveNow.getTime() - telemetryWindowMs);
  const telemetryAgg = await MachineTelemetry.aggregate([
    {
      $match: {
        machine: machine._id,
        timestamp: { $gte: windowStart, $lte: effectiveNow },
        ...sourceFilter,
      },
    },
    {
      $group: {
        _id: '$machine',
        avgTemperatureC: { $avg: '$metrics.temperatureC' },
        avgTorqueNm: { $avg: '$metrics.torqueNm' },
        avgEnergyKwh: { $avg: '$metrics.energyKwh' },
        lastSampleAt: { $max: '$timestamp' },
        dataPoints: { $sum: 1 },
      },
    },
  ]);

  const telemetrySummary = telemetryAgg.length
    ? {
        avgTemperatureC: telemetryAgg[0].avgTemperatureC ?? null,
        avgTorqueNm: telemetryAgg[0].avgTorqueNm ?? null,
        avgEnergyKwh: telemetryAgg[0].avgEnergyKwh ?? null,
        lastSampleAt: telemetryAgg[0].lastSampleAt || null,
        dataPoints: telemetryAgg[0].dataPoints || 0,
      }
    : {
        avgTemperatureC: null,
        avgTorqueNm: null,
        avgEnergyKwh: null,
        lastSampleAt: null,
        dataPoints: 0,
      };

  const machineState =
    effectiveSource === TELEMETRY_SOURCES.SHIFT_SIM
      ? await OeeMachineState.findOne({ machine: machine._id })
      : null;

  return {
    machine: {
      id: machine.id,
      code: machine.code,
      name: machine.name,
    },
    telemetry: telemetrySummary,
    signal: {
      lastValue: latestTelemetry?.signalValue ?? null,
      lastAt: latestTelemetry?.timestamp ?? null,
      currentState: machineState?.currentState ?? 'unknown',
    },
    source: effectiveSource,
    simulationRunId: latestTelemetry?.simulationRunId || null,
    windowStart,
  };
};

const getMachineTelemetrySeries = async (
  machineId,
  { limit = 20, since, view, bucketMinutes, source } = {},
) => {
  const machine = await Machine.findById(machineId);
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }

  const requestedSource = normalizeTelemetrySource(source);
  const effectiveSource =
    requestedSource === 'auto' ? await resolveAutoSource(machine._id) : requestedSource;

  const requestedView = normalizeView(view);
  const effectiveView =
    requestedView === 'auto'
      ? effectiveSource === TELEMETRY_SOURCES.SHIFT_SIM
        ? 'shift'
        : 'live'
      : requestedView;

  if (effectiveView === 'shift') {
    let clockState;
    if (effectiveSource === TELEMETRY_SOURCES.SHIFT_SIM) {
      clockState = await simulationClockService.getShiftSimClockState({ syncWithDb: true });
    }

    const payload = await getMachineShiftTelemetrySeries(machine, {
      bucketMinutes,
      source: effectiveSource,
      simulationRunId: clockState?.simulationRunId,
      shiftStartAt: clockState?.shiftStartAt,
      shiftEndAt: clockState?.shiftEndAt,
    });
    return {
      machine: {
        id: machine.id,
        code: machine.code,
        name: machine.name,
      },
      ...(clockState?.virtualDay && { virtualDay: clockState.virtualDay }),
      ...payload,
    };
  }

  const cappedLimit = Math.min(Math.max(Number(limit) || 20, 5), 200);
  const sourceFilter =
    effectiveSource === TELEMETRY_SOURCES.SHIFT_SIM
      ? { source: TELEMETRY_SOURCES.SHIFT_SIM }
      : { source: { $in: LEGACY_DATA_GEN_SOURCES } };

  const latestTelemetry = await MachineTelemetry.findOne({
    machine: machine._id,
    source: { $ne: 'seed' },
    ...sourceFilter,
  })
    .sort({ timestamp: -1 })
    .select({ timestamp: 1, simulationRunId: 1 })
    .lean();

  const effectiveNow =
    effectiveSource === TELEMETRY_SOURCES.DATA_GEN ? new Date() : latestTelemetry?.timestamp || new Date();

  const windowStart = new Date(effectiveNow.getTime() - telemetryWindowMs);
  let effectiveStart = windowStart.getTime();
  let sinceDate;
  if (since) {
    const parsed = new Date(since);
    if (!Number.isNaN(parsed.getTime())) {
      sinceDate = parsed;
      effectiveStart = Math.max(parsed.getTime(), effectiveStart);
    }
  }

  const filter = {
    machine: machine._id,
    timestamp: { $gte: new Date(effectiveStart), $lte: effectiveNow },
    ...sourceFilter,
  };

  let query = MachineTelemetry.find(filter).select({
    timestamp: 1,
    'metrics.temperatureC': 1,
    'metrics.torqueNm': 1,
    'metrics.energyKwh': 1,
    signalValue: 1,
    source: 1,
    simulationRunId: 1,
  });

  if (sinceDate) {
    query = query.sort({ timestamp: 1 }).limit(cappedLimit);
  } else {
    query = query.sort({ timestamp: -1 }).limit(cappedLimit);
  }

  const records = await query.lean();
  const series = sinceDate ? records : records.reverse();

  return {
    machine: {
      id: machine.id,
      code: machine.code,
      name: machine.name,
    },
    view: 'live',
    source: effectiveSource,
    simulationRunId: latestTelemetry?.simulationRunId || null,
    series,
    windowStart,
    windowEnd: effectiveNow,
  };
};

module.exports = {
  getGlobalMetrics,
  getMachineTelemetrySummary,
  getMachineTelemetrySeries,
  telemetryWindowMs,
};
