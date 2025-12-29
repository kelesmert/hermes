/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { connectDatabase } = require('../src/config/database');
require('../src/models');
const JobOrder = require('../src/domains/production/models/job-order-model');
const jobOrderService = require('../src/domains/production/services/job-order-service');
const MachineTelemetry = require('../src/domains/machines/models/machine-telemetry-model');
const ProductionEvent = require('../src/domains/production/models/production-event-model');
const jobOrderStatuses = require('../src/constants/job-order-statuses');
const defectTypes = require('../src/constants/defect-types');
const productionEventTypes = require('../src/constants/production-event-types');

const INTERVAL_MS = Math.max(100, Number(process.env.JOB_SIM_INTERVAL_MS) || 2000);
const DEFECT_RATE = Math.max(0, Number(process.env.JOB_SIM_DEFECT_RATE) || 0.05);
const IDLE_PROBABILITY = Math.max(0, Number(process.env.JOB_SIM_IDLE_PROBABILITY) || 0.15);
const MAX_TELEMETRY_RECORDS = Math.max(200, Number(process.env.JOB_SIM_MAX_TELEMETRY_RECORDS) || 5000);
const CYCLE_TIME_MIN_FACTOR = Math.max(0.1, Number(process.env.JOB_SIM_CYCLE_TIME_MIN_FACTOR) || 0.8);
const CYCLE_TIME_MAX_FACTOR = Math.max(
  CYCLE_TIME_MIN_FACTOR,
  Number(process.env.JOB_SIM_CYCLE_TIME_MAX_FACTOR) || 1.4,
);
const RAW_TELEMETRY_SOURCE = String(process.env.JOB_SIM_TELEMETRY_SOURCE || 'shift-sim')
  .trim()
  .toLowerCase();

const normalizeTelemetrySource = (value) => {
  if (value === 'data-gen') return 'data-gen';
  if (value === 'shift-sim') return 'shift-sim';
  if (value === 'auto') return 'auto';
  return 'shift-sim';
};

const TELEMETRY_SOURCE = normalizeTelemetrySource(RAW_TELEMETRY_SOURCE);

const buildTelemetrySourceFilter = (source) => {
  if (source === 'shift-sim') {
    return { source: 'shift-sim' };
  }
  if (source === 'data-gen') {
    return { source: { $in: ['data-gen', 'simulator'] } };
  }
  return { source: { $ne: 'seed' } };
};

const TELEMETRY_SOURCE_FILTER = buildTelemetrySourceFilter(TELEMETRY_SOURCE);
const USE_SHIFT_SIM = TELEMETRY_SOURCE === 'shift-sim';

const JOB_STATUS = jobOrderStatuses;

const PART_MB_001_CODE = 'PART-MB-001';
const PART_MB_001_CYCLE_TIME_SECONDS = Math.max(
  1,
  Number(process.env.JOB_SIM_PART_MB_001_CYCLE_TIME_SECONDS) || 600,
);

const fractionalRemainders = new Map();
const telemetryCursorByJob = new Map();

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

const cleanupTelemetryCursors = (activeJobIds) => {
  telemetryCursorByJob.forEach((_, key) => {
    if (!activeJobIds.has(key)) {
      telemetryCursorByJob.delete(key);
    }
  });
};

const pickDefectType = () => {
  const values = Object.values(defectTypes);
  if (!values.length) return undefined;
  return values[Math.floor(Math.random() * values.length)];
};

const fetchEarliestTelemetryForJob = async (jobOrderId, machineId, simulationRunId) => {
  const filter = {
    machine: machineId,
    jobOrder: jobOrderId,
    ...TELEMETRY_SOURCE_FILTER,
  };
  if (USE_SHIFT_SIM && simulationRunId) {
    filter.simulationRunId = simulationRunId;
  }
  const doc = await MachineTelemetry.findOne(filter)
    .sort({ timestamp: 1 })
    .select({ timestamp: 1 })
    .lean();
  return doc?.timestamp || null;
};

const fetchLatestTelemetryForJob = async (jobOrderId, machineId, simulationRunId) => {
  const filter = {
    machine: machineId,
    jobOrder: jobOrderId,
    ...TELEMETRY_SOURCE_FILTER,
  };
  if (USE_SHIFT_SIM && simulationRunId) {
    filter.simulationRunId = simulationRunId;
  }
  const doc = await MachineTelemetry.findOne(filter)
    .sort({ timestamp: -1 })
    .select({ timestamp: 1, simulationRunId: 1 })
    .lean();
  return doc || null;
};

const fetchLatestProductionTimestamp = async (jobOrderId, simulationRunId) => {
  const filter = {
    jobOrder: jobOrderId,
    eventType: { $in: [productionEventTypes.PRODUCE, productionEventTypes.DEFECT] },
  };
  if (simulationRunId) {
    filter['metadata.simulationRunId'] = simulationRunId;
  }
  const doc = await ProductionEvent.findOne(filter)
    .sort({ timestamp: -1 })
    .select({ timestamp: 1 })
    .lean();
  return doc?.timestamp || null;
};

const buildTelemetryQuery = (jobOrderId, machineId, after, latestTimestamp, simulationRunId) => {
  const filter = {
    machine: machineId,
    jobOrder: jobOrderId,
    ...TELEMETRY_SOURCE_FILTER,
  };
  if (USE_SHIFT_SIM && simulationRunId) {
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

const fetchTelemetrySince = async (jobOrderId, machineId, after, latestTimestamp, simulationRunId) => {
  const filter = buildTelemetryQuery(jobOrderId, machineId, after, latestTimestamp, simulationRunId);

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

const sampleTriangular = (min, mode, max) => {
  if (max <= min) return min;
  const safeMode = Math.min(Math.max(mode, min), max);
  const u = Math.random();
  const c = (safeMode - min) / (max - min);
  if (u < c) {
    return min + Math.sqrt(u * (max - min) * (safeMode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - safeMode));
};

const sampleCycleTimeSeconds = (idealCycleTimeSeconds) => {
  const min = idealCycleTimeSeconds * CYCLE_TIME_MIN_FACTOR;
  const max = idealCycleTimeSeconds * CYCLE_TIME_MAX_FACTOR;
  return sampleTriangular(min, idealCycleTimeSeconds, max);
};

const sampleDefectiveCount = (totalQuantity, defectRate) => {
  if (defectRate <= 0) return 0;
  if (defectRate >= 1) return totalQuantity;
  let defective = 0;
  for (let i = 0; i < totalQuantity; i += 1) {
    if (Math.random() < defectRate) {
      defective += 1;
    }
  }
  return defective;
};

const computeQuantityForInterval = (cycleTimeSeconds, intervalMs, jobId) => {
  const cyclesPerMinute = 60 / cycleTimeSeconds;
  const expectedForInterval = cyclesPerMinute * (intervalMs / 60000);
  const carry = getRemainder(jobId);
  const quantity = Math.floor(expectedForInterval + carry);
  updateRemainder(jobId, expectedForInterval + carry - quantity);
  return quantity;
};

const processJobOrder = async (jobOrder) => {
  if (!jobOrder.part?.idealCycleTime || jobOrder.part.idealCycleTime <= 0) {
    return;
  }
  const machineId = jobOrder.machine?._id?.toString?.();
  if (!machineId) {
    return;
  }

  const jobId = getJobId(jobOrder);
  const jobSimulationSource = String(jobOrder.metadata?.simulationSource || '').trim().toLowerCase();
  if (jobSimulationSource && jobSimulationSource !== TELEMETRY_SOURCE && jobSimulationSource !== 'auto') {
    return;
  }

  const latest = await fetchLatestTelemetryForJob(jobOrder._id, jobOrder.machine._id);
  if (!latest?.timestamp) {
    return;
  }

  const latestRunId = USE_SHIFT_SIM ? latest.simulationRunId || null : null;
  let cursorEntry = telemetryCursorByJob.get(jobId);
  if (!cursorEntry || cursorEntry.simulationRunId !== latestRunId) {
    const [earliestTimestamp, lastProducedAt] = await Promise.all([
      fetchEarliestTelemetryForJob(jobOrder._id, jobOrder.machine._id, latestRunId),
      fetchLatestProductionTimestamp(jobOrder._id, latestRunId),
    ]);
    const baseTimestamp =
      lastProducedAt && lastProducedAt.getTime() < latest.timestamp.getTime()
        ? lastProducedAt
        : earliestTimestamp || latest.timestamp;
    const startAt = new Date(baseTimestamp.getTime() - 1);

    cursorEntry = { timestamp: startAt, simulationRunId: latestRunId };
    telemetryCursorByJob.set(jobId, cursorEntry);
  }

  const cursor = cursorEntry.timestamp;

  if (latest.timestamp.getTime() <= cursor.getTime()) {
    return;
  }

  const telemetry = await fetchTelemetrySince(
    jobOrder._id,
    jobOrder.machine._id,
    cursor,
    latest.timestamp,
    latestRunId,
  );
  if (!telemetry.length) {
    telemetryCursorByJob.set(jobId, { timestamp: latest.timestamp, simulationRunId: latestRunId });
    return;
  }

  const simulationRunId = latestRunId;
  const isShiftSim = USE_SHIFT_SIM;
  const effectiveDefectRate = DEFECT_RATE;
  const effectiveIdleProbability = isShiftSim ? 0 : IDLE_PROBABILITY;

  const effectiveIdealCycleTimeSeconds =
    jobOrder.part?.code === PART_MB_001_CODE
      ? PART_MB_001_CYCLE_TIME_SECONDS
      : jobOrder.part.idealCycleTime;

  const remainingQuantity = Math.max(
    Number(jobOrder.targetQuantity || 0) - Number(jobOrder.producedQuantity || 0),
    0,
  );
  if (remainingQuantity <= 0) {
    return;
  }

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
    const cycleTimeSeconds = sampleCycleTimeSeconds(effectiveIdealCycleTimeSeconds);
    totalQuantity += computeQuantityForInterval(cycleTimeSeconds, intervalMs, jobId);
  }

  telemetryCursorByJob.set(jobId, { timestamp: lastTimestamp, simulationRunId: latestRunId });

  if (totalQuantity <= 0) {
    return;
  }

  if (totalQuantity > remainingQuantity) {
    totalQuantity = remainingQuantity;
  }

  let defective = sampleDefectiveCount(totalQuantity, effectiveDefectRate);
  if (defective > totalQuantity) defective = totalQuantity;
  const good = totalQuantity - defective;

  const resolvedSimulationSource =
    TELEMETRY_SOURCE === 'auto' ? telemetry[0]?.source || 'auto' : TELEMETRY_SOURCE;
  const baseMetadata = {
    simulationSource: resolvedSimulationSource,
    ...(simulationRunId ? { simulationRunId } : {}),
  };
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
    cleanupTelemetryCursors(activeJobIds);

    for (const job of activeJobs) {
      try {
        await processJobOrder(job);
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
