/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { connectDatabase } = require('../src/config/database');
require('../src/models');
const JobOrder = require('../src/domains/production/models/job-order-model');
const jobOrderService = require('../src/domains/production/services/job-order-service');
const jobOrderStatuses = require('../src/constants/job-order-statuses');
const machineStatuses = require('../src/constants/machine-statuses');
const defectTypes = require('../src/constants/defect-types');

const INTERVAL_MS = Number(process.env.JOB_SIM_INTERVAL_MS) || 2000;
const DEFECT_RATE = Number(process.env.JOB_SIM_DEFECT_RATE) || 0.05;
const IDLE_PROBABILITY = Number(process.env.JOB_SIM_IDLE_PROBABILITY) || 0.15;

const fractionalRemainders = new Map();

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

const pickDefectType = () => {
  const values = Object.values(defectTypes);
  if (!values.length) return undefined;
  return values[Math.floor(Math.random() * values.length)];
};

const shouldSkipCycle = () => Math.random() < IDLE_PROBABILITY;

const processJobOrder = async (jobOrder) => {
  if (!jobOrder.part?.idealCycleTime || jobOrder.part.idealCycleTime <= 0) {
    return;
  }
  if (!jobOrder.machine || jobOrder.machine.status !== machineStatuses.RUNNING) {
    return;
  }
  if (shouldSkipCycle()) {
    return;
  }

  const jobId = getJobId(jobOrder);
  const cyclesPerMinute = 60 / jobOrder.part.idealCycleTime;
  const expectedPerTick = cyclesPerMinute * (INTERVAL_MS / 60000);
  const carry = getRemainder(jobId);
  const totalQuantity = Math.floor(expectedPerTick + carry);
  updateRemainder(jobId, expectedPerTick + carry - totalQuantity);

  if (totalQuantity <= 0) {
    return;
  }

  let defective = Math.floor(totalQuantity * DEFECT_RATE * Math.random());
  if (defective > totalQuantity) defective = totalQuantity;
  const good = totalQuantity - defective;

  if (good > 0) {
    await jobOrderService.recordProduction(jobId, {
      quantity: good,
      qualityStatus: 'good',
      source: 'simulator',
    });
  }

  if (defective > 0) {
    await jobOrderService.recordProduction(jobId, {
      quantity: defective,
      qualityStatus: 'defective',
      defectType: pickDefectType(),
      source: 'simulator',
    });
  }

  console.log(`[job-sim] ${jobOrder.orderNo || jobId}: ${good} iyi, ${defective} hatalı üretildi.`);
};

const runSimulatorTick = async () => {
  try {
    const activeJobs = await JobOrder.find({ status: jobOrderStatuses.IN_PROGRESS })
      .populate('part', 'idealCycleTime name code')
      .populate('machine', 'status name code');

    const activeIds = new Set(activeJobs.map((job) => getJobId(job)));
    cleanupRemainders(activeIds);

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
