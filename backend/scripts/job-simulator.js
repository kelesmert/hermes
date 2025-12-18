/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/database');
require('../src/models');
const JobOrder = require('../src/domains/production/models/job-order-model');
const jobOrderService = require('../src/domains/production/services/job-order-service');
const MachineTelemetry = require('../src/domains/machines/models/machine-telemetry-model');
const jobOrderStatuses = require('../src/constants/job-order-statuses');
const defectTypes = require('../src/constants/defect-types');

const INTERVAL_MS = Math.max(100, Number(process.env.JOB_SIM_INTERVAL_MS) || 2000);
const DEFECT_RATE = Math.max(0, Number(process.env.JOB_SIM_DEFECT_RATE) || 0.05);
const IDLE_PROBABILITY = Math.max(0, Number(process.env.JOB_SIM_IDLE_PROBABILITY) || 0.15);
const MAX_TELEMETRY_RECORDS = Math.max(200, Number(process.env.JOB_SIM_MAX_TELEMETRY_RECORDS) || 5000);

const JOB_STATUS = jobOrderStatuses;

const PART_MB_001_CODE = 'PART-MB-001';
const PART_MB_001_CYCLE_TIME_SECONDS = Math.max(
  1,
  Number(process.env.JOB_SIM_PART_MB_001_CYCLE_TIME_SECONDS) || 600,
);

const fractionalRemainders = new Map();
const telemetryCursorByMachine = new Map();

const getJobId = (jobOrder) => jobOrder.id || jobOrder._id.toString();

const getRemainder = (jobId) => fractionalRemainders.get(jobId) || 0;

const updateRemainder = (jobId, value) => {
  fractionalRemainders.set(jobId, value);
};

const cleanupRemainders = (activeJobIds) => {
  fractionalRemainders.forEach((_, key) => {
    if (!activeJobIds.has(key)) {
      fractionalRemainders.delete(key);
    }
  });
};

const cleanupTelemetryCursors = (activeMachineIds) => {
  telemetryCursorByMachine.forEach((_, key) => {
    if (!activeMachineIds.has(key)) {
      telemetryCursorByMachine.delete(key);
    }
  });
};

const pickDefectType = () => {
  const values = Object.values(defectTypes);
  if (!values.length) return undefined;
  return values[Math.floor(Math.random() * values.length)];
};

const normalizeObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
  }
  return null;
};

const fetchEarliestTelemetryTimestampForRun = async (machineId, simulationRunId) => {
  if (!simulationRunId) return null;
  const doc = await MachineTelemetry.findOne({
    machine: machineId,
    source: 'shift-sim',
    simulationRunId,
  })
    .sort({ timestamp: 1 })
    .select({ timestamp: 1 })
    .lean();
  return doc?.timestamp || null;
};

const fetchLatestShiftSimTelemetry = async (machineIds) => {
  if (!machineIds.length) {
    return new Map();
  }

  const results = await MachineTelemetry.aggregate([
    {
      $match: {
        machine: { $in: machineIds },
        source: 'shift-sim',
        simulationRunId: { $exists: true, $ne: null },
      },
    },
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: '$machine',
        timestamp: { $first: '$timestamp' },
        simulationRunId: { $first: '$simulationRunId' },
      },
    },
  ]);

  const map = new Map();
  results.forEach((item) => {
    map.set(item._id.toString(), {
      timestamp: item.timestamp,
      simulationRunId: item.simulationRunId || null,
    });
  });
  return map;
};

const fetchLatestTelemetry = async (machineIds) => {
  const normalizedIds = machineIds
    .map((id) => normalizeObjectId(id))
    .filter((id) => id);

  if (!normalizedIds.length) {
    return new Map();
  }

  const [shiftSimLatest, results] = await Promise.all([
    fetchLatestShiftSimTelemetry(normalizedIds),
    MachineTelemetry.aggregate([
      { $match: { machine: { $in: normalizedIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$machine',
          timestamp: { $first: '$timestamp' },
          simulationRunId: { $first: '$simulationRunId' },
        },
      },
    ]),
  ]);

  const fallback = new Map();
  results.forEach((item) => {
    fallback.set(item._id.toString(), {
      timestamp: item.timestamp,
      simulationRunId: item.simulationRunId || null,
    });
  });

  const map = new Map();
  normalizedIds.forEach((id) => {
    const key = id.toString();
    if (shiftSimLatest.has(key)) {
      map.set(key, shiftSimLatest.get(key));
      return;
    }
    if (fallback.has(key)) {
      map.set(key, fallback.get(key));
    }
  });

  return map;
};

const buildTelemetryQuery = (machineId, after, latestTimestamp, simulationRunId) => {
  const filter = { machine: machineId };
  if (simulationRunId) {
    filter.simulationRunId = simulationRunId;
  }
  if (after) {
    filter.timestamp = { $gt: after };
    if (latestTimestamp) {
      filter.timestamp.$lte = latestTimestamp;
    }
  } else if (latestTimestamp) {
    filter.timestamp = { $lte: latestTimestamp };
  }
  return filter;
};

const fetchTelemetrySince = async (machineId, after, latestTimestamp, simulationRunId) => {
  const filter = buildTelemetryQuery(machineId, after, latestTimestamp, simulationRunId);

  return MachineTelemetry.find(filter)
    .sort({ timestamp: 1 })
    .limit(MAX_TELEMETRY_RECORDS)
    .select({
      timestamp: 1,
      signalValue: 1,
      intervalMs: 1,
      source: 1,
      simulationRunId: 1,
    })
    .lean();
};

const shouldSkipInterval = (probability) => probability > 0 && Math.random() < probability;

const computeQuantityForInterval = (idealCycleTimeSeconds, intervalMs, jobId) => {
  const cyclesPerMinute = 60 / idealCycleTimeSeconds;
  const expectedForInterval = cyclesPerMinute * (intervalMs / 60000);
  const carry = getRemainder(jobId);
  const quantity = Math.floor(expectedForInterval + carry);
  updateRemainder(jobId, expectedForInterval + carry - quantity);
  return quantity;
};

const processJobOrder = async (jobOrder, latestTelemetry) => {
  if (!jobOrder.part?.idealCycleTime || jobOrder.part.idealCycleTime <= 0) {
    return;
  }
  const machineId = jobOrder.machine?._id?.toString?.();
  if (!machineId) {
    return;
  }

  const latest = latestTelemetry.get(machineId);
  if (!latest?.timestamp) {
    return;
  }

  const latestRunId = latest.simulationRunId || null;
  let cursorEntry = telemetryCursorByMachine.get(machineId);
  if (!cursorEntry || cursorEntry.simulationRunId !== latestRunId) {
    if (!latestRunId) {
      telemetryCursorByMachine.set(machineId, { timestamp: latest.timestamp, simulationRunId: null });
      return;
    }

    const earliestTimestamp = await fetchEarliestTelemetryTimestampForRun(jobOrder.machine._id, latestRunId);
    const startAt = earliestTimestamp
      ? new Date(earliestTimestamp.getTime() - 1)
      : new Date(latest.timestamp.getTime() - 1);

    cursorEntry = { timestamp: startAt, simulationRunId: latestRunId };
    telemetryCursorByMachine.set(machineId, cursorEntry);
  }

  const cursor = cursorEntry.timestamp;

  if (latest.timestamp.getTime() <= cursor.getTime()) {
    return;
  }

  const telemetry = await fetchTelemetrySince(jobOrder.machine._id, cursor, latest.timestamp, latestRunId);
  if (!telemetry.length) {
    telemetryCursorByMachine.set(machineId, latest.timestamp);
    return;
  }

  const simulationRunId = latestRunId;
  const isShiftSim = Boolean(simulationRunId);
  const effectiveDefectRate = isShiftSim ? 0 : DEFECT_RATE;
  const effectiveIdleProbability = isShiftSim ? 0 : IDLE_PROBABILITY;

  const effectiveIdealCycleTimeSeconds =
    jobOrder.part?.code === PART_MB_001_CODE
      ? PART_MB_001_CYCLE_TIME_SECONDS
      : jobOrder.part.idealCycleTime;

  const jobId = getJobId(jobOrder);
  let totalQuantity = 0;
  let lastTimestamp = cursor;
  for (const sample of telemetry) {
    if (!sample?.timestamp) continue;
    lastTimestamp = sample.timestamp;

    if (sample.signalValue !== 1) {
      continue;
    }

    if (shouldSkipInterval(effectiveIdleProbability)) {
      continue;
    }

    const intervalMs = Math.max(100, Number(sample.intervalMs) || INTERVAL_MS);
    totalQuantity += computeQuantityForInterval(effectiveIdealCycleTimeSeconds, intervalMs, jobId);
  }

  telemetryCursorByMachine.set(machineId, { timestamp: lastTimestamp, simulationRunId: latestRunId });

  if (totalQuantity <= 0) {
    return;
  }

  let defective = 0;
  if (effectiveDefectRate > 0) {
    defective = Math.floor(totalQuantity * effectiveDefectRate * Math.random());
    if (defective > totalQuantity) defective = totalQuantity;
  }
  const good = totalQuantity - defective;

  const baseMetadata = simulationRunId ? { simulationRunId, simulationSource: 'shift-sim' } : undefined;
  const eventTime = lastTimestamp;

  if (good > 0) {
    await jobOrderService.recordProduction(jobId, {
      quantity: good,
      qualityStatus: 'good',
      source: 'simulator',
      timestamp: eventTime,
      metadata: baseMetadata,
    });
  }

  if (defective > 0) {
    await jobOrderService.recordProduction(jobId, {
      quantity: defective,
      qualityStatus: 'defective',
      defectType: pickDefectType(),
      source: 'simulator',
      timestamp: eventTime,
      metadata: baseMetadata,
    });
  }

  const tag = simulationRunId ? ` run=${simulationRunId}` : '';
  console.log(`[job-sim] ${jobOrder.orderNo || jobId}: +${good} iyi, +${defective} hatalı t=${eventTime.toISOString()}${tag}`);
};

const runSimulatorTick = async () => {
  try {
    const activeJobs = await JobOrder.find({
      status: JOB_STATUS.IN_PROGRESS,
    })
      .populate('part', 'idealCycleTime name code')
      .populate('machine', 'status name code');

    const activeJobIds = new Set(activeJobs.map((job) => getJobId(job)));
    cleanupRemainders(activeJobIds);

    const machineIds = activeJobs.map((job) => job.machine?._id).filter(Boolean);
    const activeMachineIds = new Set(machineIds.map((id) => id.toString()));
    cleanupTelemetryCursors(activeMachineIds);

    if (!machineIds.length) {
      return;
    }

    const latestTelemetry = await fetchLatestTelemetry(machineIds);

    for (const job of activeJobs) {
      try {
        await processJobOrder(job, latestTelemetry);
      } catch (jobError) {
        console.error('[job-sim] Job işlenemedi:', job.orderNo || job.id, jobError.message);
      }
    }
  } catch (error) {
    console.error('[job-sim] Döngü hatası:', error.message);
  }
};

const startSimulator = async () => {
  try {
    await connectDatabase();
    console.log(`[job-sim] ${INTERVAL_MS}ms aralıkla üretim simülasyonu başlatıldı.`);
    await runSimulatorTick();
    const intervalRef = setInterval(runSimulatorTick, INTERVAL_MS);

    const shutdown = () => {
      clearInterval(intervalRef);
      console.log('[job-sim] Simülasyon durduruldu.');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[job-sim] Başlatılamadı:', error.message);
    process.exit(1);
  }
};

startSimulator();
