const path = require('path');
const fs = require('fs');
const Machine = require('../../machines/models/machine-model');
const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const MachineEvent = require('../../machines/models/machine-event-model');
const OeeMachineState = require('../models/oee-machine-state-model');
const machineStatuses = require('../../../constants/machine-statuses');
const AppError = require('../../../utils/app-error');

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
const MAX_RAW_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_TREND_RANGE_HOURS = 24 * 14;

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
  const windowStart = new Date(Date.now() - telemetryWindowMs);
  const telemetryAgg = await MachineTelemetry.aggregate([
    { $match: { timestamp: { $gte: windowStart } } },
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
  const windowStart = new Date(Date.now() - telemetryWindowMs);
  const now = new Date();

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

const getMachineTelemetrySummary = async (machineId) => {
  const machine = await Machine.findById(machineId);
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }

  const windowStart = new Date(Date.now() - telemetryWindowMs);
  const telemetryAgg = await MachineTelemetry.aggregate([
    {
      $match: {
        machine: machine._id,
        timestamp: { $gte: windowStart },
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

  const machineState = await OeeMachineState.findOne({ machine: machine._id });

  return {
    machine: {
      id: machine.id,
      code: machine.code,
      name: machine.name,
    },
    telemetry: telemetrySummary,
    signal: {
      lastValue: machineState?.lastSignalValue ?? null,
      lastAt: machineState?.lastSignalAt ?? null,
      currentState: machineState?.currentState ?? 'unknown',
    },
    windowStart,
  };
};

const resolveWindowMs = (windowMs) => {
  const parsed = Number(windowMs);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed, MAX_RAW_WINDOW_MS);
  }
  return Math.min(telemetryWindowMs, MAX_RAW_WINDOW_MS);
};

const getMachineTelemetrySeries = async (machineId, { limit = 20, since, windowMs } = {}) => {
  const machine = await Machine.findById(machineId);
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }

  const cappedLimit = Math.min(Math.max(Number(limit) || 20, 5), 2000);
  const resolvedWindowMs = resolveWindowMs(windowMs);
  const windowStart = new Date(Date.now() - resolvedWindowMs);
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
    timestamp: { $gte: new Date(effectiveStart) },
  };

  let query = MachineTelemetry.find(filter).select({
    timestamp: 1,
    'metrics.temperatureC': 1,
    'metrics.torqueNm': 1,
    'metrics.energyKwh': 1,
    signalValue: 1,
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
    series,
    windowStart,
    windowEnd: new Date(),
    windowMs: resolvedWindowMs,
  };
};

const getMachineTelemetryTrend = async (
  machineId,
  { rangeHours = 168, binMinutes = 60 } = {},
) => {
  const machine = await Machine.findById(machineId);
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }

  const resolvedRangeHours = (() => {
    const parsed = Number(rangeHours);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(parsed, MAX_TREND_RANGE_HOURS);
    }
    return 168;
  })();

  const resolvedBinMinutes = (() => {
    const parsed = Number(binMinutes);
    if (Number.isFinite(parsed) && parsed >= 1) {
      return Math.min(parsed, resolvedRangeHours * 60);
    }
    return 60;
  })();

  const rangeMs = resolvedRangeHours * 60 * 60 * 1000;
  const bucketMs = resolvedBinMinutes * 60 * 1000;
  const windowStart = new Date(Date.now() - rangeMs);

  const pipeline = [
    {
      $match: {
        machine: machine._id,
        timestamp: { $gte: windowStart },
      },
    },
    {
      $addFields: {
        bucketStartMs: {
          $subtract: [{ $toLong: '$timestamp' }, { $mod: [{ $toLong: '$timestamp' }, bucketMs] }],
        },
      },
    },
    {
      $group: {
        _id: '$bucketStartMs',
        avgTemperatureC: { $avg: '$metrics.temperatureC' },
        avgTorqueNm: { $avg: '$metrics.torqueNm' },
        avgEnergyKwh: { $avg: '$metrics.energyKwh' },
        uptimeRatio: { $avg: '$signalValue' },
        samples: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const buckets = await MachineTelemetry.aggregate(pipeline);
  const normalizedBuckets = buckets.map((bucket) => ({
    bucketStart: new Date(bucket._id),
    avgTemperatureC: bucket.avgTemperatureC ?? null,
    avgTorqueNm: bucket.avgTorqueNm ?? null,
    avgEnergyKwh: bucket.avgEnergyKwh ?? null,
    uptimeRatio: bucket.uptimeRatio ?? null,
    samples: bucket.samples,
  }));

  return {
    machine: {
      id: machine.id,
      code: machine.code,
      name: machine.name,
    },
    range: {
      hours: resolvedRangeHours,
      binMinutes: resolvedBinMinutes,
      windowStart,
      windowEnd: new Date(),
    },
    buckets: normalizedBuckets,
  };
};

module.exports = {
  getGlobalMetrics,
  getMachineTelemetrySummary,
  getMachineTelemetrySeries,
  getMachineTelemetryTrend,
  telemetryWindowMs,
};
