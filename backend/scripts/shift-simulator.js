/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { connectDatabase } = require('../src/config/database');
require('../src/models');

const Machine = require('../src/domains/machines/models/machine-model');
const MachineEvent = require('../src/domains/machines/models/machine-event-model');
const MachineTelemetry = require('../src/domains/machines/models/machine-telemetry-model');
const JobOrder = require('../src/domains/production/models/job-order-model');
const machineStatuses = require('../src/constants/machine-statuses');
const jobOrderStatuses = require('../src/constants/job-order-statuses');
const jobOrderService = require('../src/domains/production/services/job-order-service');
const { createEvent: createMachineEvent } = require('../src/domains/machines/services/machine-event-service');
const simulationClockService = require('../src/domains/simulations/services/simulation-clock-service');

const REAL_TICK_MS = Math.max(50, Number(process.env.SHIFT_SIM_TICK_MS) || 250);
const REAL_DURATION_SECONDS = Math.max(
  30,
  Number(process.env.SHIFT_SIM_REAL_DURATION_SECONDS) || 180,
);
const SAMPLE_INTERVAL_MS = Math.max(500, Number(process.env.SHIFT_SIM_INTERVAL_MS) || 2000);
const MACHINE_REFRESH_MS = Math.max(
  REAL_TICK_MS,
  Number(process.env.SHIFT_SIM_MACHINE_REFRESH_MS) || 5000,
);

const SOURCE = 'shift-sim';
const CLEAR_BEFORE_START =
  process.env.SHIFT_SIM_CLEAR_BEFORE_START === undefined
    ? false
    : String(process.env.SHIFT_SIM_CLEAR_BEFORE_START).toLowerCase() === 'true';
const PLANNED_STOPPED_MODE =
  process.env.SHIFT_SIM_PLANNED_STOPPED_MODE === undefined
    ? true
    : String(process.env.SHIFT_SIM_PLANNED_STOPPED_MODE).toLowerCase() === 'true';

const SCHEDULE_MINUTES = [
  { minutes: 60, signal: 1 }, // 07:00 - 08:00 running
  { minutes: 30, signal: 0 }, // 08:00 - 08:30 unplanned downtime (test)
  { minutes: 570, signal: 1 }, // 08:30 - 18:00 running
];

const METRIC_PROFILES = {
  active: {
    temperature: { base: 60, variance: 3, smoothing: 0.25, noise: 0.4, min: 40 },
    torque: { base: 120, variance: 10, smoothing: 0.3, noise: 1.5, min: 60 },
    energy: { base: 3.2, variance: 0.4, smoothing: 0.35, noise: 0.08, min: 0.5 },
  },
  idle: {
    temperature: { base: 34, variance: 2, smoothing: 0.25, noise: 0.3, min: 25 },
    torque: { base: 6, variance: 2, smoothing: 0.3, noise: 0.5, min: 0 },
    energy: { base: 0.25, variance: 0.05, smoothing: 0.35, noise: 0.02, min: 0.05 },
  },
  planned: {
    temperature: { base: 0, variance: 0, smoothing: 0.9, noise: 0, min: 0 },
    torque: { base: 0, variance: 0, smoothing: 0.9, noise: 0, min: 0 },
    energy: { base: 0, variance: 0, smoothing: 0.9, noise: 0, min: 0 },
  },
};

const TRANSITION_WINDOW_MS = Math.max(0, Number(process.env.SHIFT_SIM_TRANSITION_MS) || 10000);
const TRANSITION_TICKS = Math.max(1, Math.round(TRANSITION_WINDOW_MS / SAMPLE_INTERVAL_MS));

const ASSIGNED_JOB_STATUSES = [jobOrderStatuses.IN_PROGRESS, jobOrderStatuses.PAUSED];
const RUNNING_JOB_STATUSES = [jobOrderStatuses.IN_PROGRESS];

const SHIFT_END_PAUSE_REASON = 'shift_end';
const WAIT_FOR_PROCESSING_MS = Math.max(
  0,
  Number(process.env.SHIFT_SIM_WAIT_FOR_PROCESSING_MS) || 5 * 60 * 1000,
);

const machineStates = new Map();
let machines = [];
let lastMachineRefresh = 0;
let plannedDowntimeMachines = new Set();
let lastPlannedDowntimeRefresh = 0;
let stopRequested = false;

const hashToInt = (value) => {
  const text = String(value || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return hash;
};

const createRng = (seed) => {
  let x = seed | 0;
  return () => {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return ((x >>> 0) / 4294967296);
  };
};

const randomDrift = (rng, delta) => (rng() * 2 - 1) * delta;

const initializeMetric = (rng, profile) => {
  const target = profile.base + randomDrift(rng, profile.variance);
  return Number(Math.max(profile.min ?? target, target).toFixed(2));
};

const adjustMetric = (rng, current, profile, transitionProgress = 1) => {
  if (typeof current !== 'number' || Number.isNaN(current)) {
    return initializeMetric(rng, profile);
  }
  const target = profile.base + randomDrift(rng, profile.variance);
  const baseSmoothing = profile.smoothing ?? 0.3;
  const boost = Math.max(0, (TRANSITION_TICKS - transitionProgress) / TRANSITION_TICKS);
  const effectiveSmoothing = Math.min(0.95, baseSmoothing + boost * 0.6);
  const next = current + (target - current) * effectiveSmoothing + randomDrift(rng, profile.noise ?? 0.1);
  const bounded = profile.min !== undefined && next < profile.min ? profile.min : next;
  return Number(bounded.toFixed(2));
};

const ensureMachineState = (machine) => {
  const key = machine.id || machine._id.toString();
  if (!machineStates.has(key)) {
    const seed = hashToInt(key);
    const rng = createRng(seed);
    const profile = METRIC_PROFILES.idle;
    machineStates.set(key, {
      rng,
      temperature: initializeMetric(rng, profile.temperature),
      torque: initializeMetric(rng, profile.torque),
      energy: initializeMetric(rng, profile.energy),
      mode: 'idle',
      transitionTicks: TRANSITION_TICKS,
      hasAssignedJob: false,
      hasRunningJob: false,
    });
  }
  return machineStates.get(key);
};

const loadMachines = async () => {
  machines = await Machine.find({ isActive: true }).select({
    status: 1,
    currentJobOrder: 1,
    isActive: 1,
  });

  const jobIds = machines
    .map((machine) => machine.currentJobOrder)
    .filter(Boolean);

  const jobs = jobIds.length
    ? await JobOrder.find({ _id: { $in: jobIds } })
        .select({ _id: 1, status: 1, machine: 1 })
        .lean()
    : [];

  const jobById = new Map(jobs.map((job) => [job._id.toString(), job]));
  const staleMachineIds = [];

  machines.forEach((machine) => {
    const state = ensureMachineState(machine);
    const jobId = machine.currentJobOrder?.toString?.();
    const job = jobId ? jobById.get(jobId) : undefined;
    const jobMachineId = job?.machine?.toString?.();
    const jobBelongsToMachine = Boolean(jobMachineId && jobMachineId === machine._id.toString());
    const hasAssignedJob = Boolean(job && jobBelongsToMachine && ASSIGNED_JOB_STATUSES.includes(job.status));
    const hasRunningJob = Boolean(job && jobBelongsToMachine && RUNNING_JOB_STATUSES.includes(job.status));
    state.hasAssignedJob = hasAssignedJob;
    state.hasRunningJob = hasRunningJob;

    if (jobId && !hasAssignedJob) {
      staleMachineIds.push(machine._id);
    }
  });

  if (staleMachineIds.length) {
    const staleMachineIdSet = new Set(staleMachineIds.map((id) => id.toString()));
    await Machine.updateMany(
      { _id: { $in: staleMachineIds } },
      { $set: { currentJobOrder: null, status: machineStatuses.IDLE } },
    );
    machines.forEach((machine) => {
      if (staleMachineIdSet.has(machine._id.toString())) {
        machine.currentJobOrder = null;
        machine.status = machineStatuses.IDLE;
      }
    });
  }

  lastMachineRefresh = Date.now();
  console.log(`[shift-sim] ${machines.length} makine yüklendi.`);
};

const ensureMachinesUpToDate = async () => {
  const now = Date.now();
  if (!machines.length || now - lastMachineRefresh >= MACHINE_REFRESH_MS) {
    await loadMachines();
  }
};

const loadOpenPlannedDowntimeMachineSet = async () => {
  if (!PLANNED_STOPPED_MODE) return new Set();
  if (!machines.length) return new Set();

  const machineIds = machines.map((machine) => machine._id);
  if (!machineIds.length) return new Set();

  const openPlanned = await MachineEvent.find({
    machine: { $in: machineIds },
    state: machineStatuses.DOWNTIME,
    reasonCategory: 'planned',
    endedAt: { $exists: false },
  }).select({ machine: 1 });

  const plannedMachines = new Set();
  openPlanned.forEach((event) => plannedMachines.add(event.machine.toString()));
  return plannedMachines;
};

const ensurePlannedDowntimeUpToDate = async () => {
  const now = Date.now();
  if (!PLANNED_STOPPED_MODE) return;
  if (!plannedDowntimeMachines.size || now - lastPlannedDowntimeRefresh >= Math.max(REAL_TICK_MS, 2000)) {
    plannedDowntimeMachines = await loadOpenPlannedDowntimeMachineSet();
    lastPlannedDowntimeRefresh = now;
  }
};

const buildScheduleSegments = () => {
  let cursorMs = 0;
  const segments = [];
  for (const item of SCHEDULE_MINUTES) {
    const durationMs = item.minutes * 60 * 1000;
    segments.push({ startOffsetMs: cursorMs, endOffsetMs: cursorMs + durationMs, signal: item.signal });
    cursorMs += durationMs;
  }
  return segments;
};

const scheduleSegments = buildScheduleSegments();

const getSignalForOffsetMs = (offsetMs) => {
  for (const segment of scheduleSegments) {
    if (offsetMs >= segment.startOffsetMs && offsetMs < segment.endOffsetMs) {
      return segment.signal;
    }
  }
  return 0;
};

const computeMetrics = (state, mode) => {
  const rng = state.rng;
  const profile = METRIC_PROFILES[mode] || METRIC_PROFILES.idle;
  const modeChanged = state.mode !== mode;
  if (modeChanged) {
    state.mode = mode;
    state.transitionTicks = 0;
  } else {
    state.transitionTicks = Math.min((state.transitionTicks || 0) + 1, TRANSITION_TICKS);
  }

  const transitionProgress = state.transitionTicks || TRANSITION_TICKS;
  state.temperature = adjustMetric(rng, state.temperature, profile.temperature, transitionProgress);
  state.torque = adjustMetric(rng, state.torque, profile.torque, transitionProgress);
  state.energy = adjustMetric(rng, state.energy, profile.energy, transitionProgress);

  return {
    temperatureC: Number(state.temperature.toFixed(2)),
    torqueNm: Number(state.torque.toFixed(2)),
    energyKwh: Number(state.energy.toFixed(2)),
  };
};

const generateTelemetryPayload = (machine, timestamp, runId) => {
  const state = ensureMachineState(machine);
  const machineKey = machine.id || machine._id.toString();
  const isPlannedStopped = plannedDowntimeMachines.has(machineKey);
  const hasRunningJob = Boolean(state.hasRunningJob);
  const mode = isPlannedStopped ? 'planned' : hasRunningJob ? 'active' : 'idle';

  const offsetMs = Math.max(0, timestamp.getTime() - currentShiftWindow.startAt.getTime());
  const scheduleSignal = getSignalForOffsetMs(offsetMs);
  const signalValue = isPlannedStopped ? 0 : hasRunningJob ? scheduleSignal : 0;

  const metrics =
    isPlannedStopped || signalValue === 0
      ? computeMetrics(state, isPlannedStopped ? 'planned' : 'idle')
      : computeMetrics(state, mode);

  if (isPlannedStopped) {
    return {
      machine: machine._id,
      timestamp,
      signalValue: 0,
      metrics,
      intervalMs: SAMPLE_INTERVAL_MS,
      source: SOURCE,
      simulationRunId: runId,
    };
  }

  return {
    machine: machine._id,
    timestamp,
    signalValue,
    metrics,
    intervalMs: SAMPLE_INTERVAL_MS,
    source: SOURCE,
    simulationRunId: runId,
  };
};

let currentShiftWindow = null;

const formatIso = (date) => (date ? new Date(date).toISOString() : '');

const waitForProcessing = async (runId, { timeoutMs = WAIT_FOR_PROCESSING_MS } = {}) => {
  if (!timeoutMs) {
    return { ok: true, skipped: true };
  }

  const deadline = Date.now() + timeoutMs;
  let lastLogAt = 0;

  while (Date.now() < deadline) {
    const remaining = await MachineTelemetry.findOne({
      source: SOURCE,
      simulationRunId: runId,
      processedAt: { $exists: false },
    })
      .select({ _id: 1 })
      .lean();

    if (!remaining) {
      return { ok: true };
    }

    const now = Date.now();
    if (now - lastLogAt >= 5000) {
      console.log('[shift-sim] Telemetry işlenmesi bekleniyor...');
      lastLogAt = now;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { ok: false, timeoutMs };
};

const applyShiftEndPolicy = async ({ shiftEndAt, runId }) => {
  await loadMachines();

  const machineIdsWithJob = machines
    .filter((machine) => machine.currentJobOrder)
    .map((machine) => machine._id);

  if (!machineIdsWithJob.length) {
    return;
  }

  const jobIds = machines
    .map((machine) => machine.currentJobOrder)
    .filter(Boolean);

  const jobs = await JobOrder.find({ _id: { $in: jobIds } })
    .select({ _id: 1, status: 1, machine: 1, orderNo: 1 })
    .lean();

  const jobById = new Map(jobs.map((job) => [job._id.toString(), job]));

  for (const machine of machines) {
    if (!machine.currentJobOrder) continue;

    const jobId = machine.currentJobOrder?.toString?.();
    const job = jobId ? jobById.get(jobId) : undefined;
    const jobBelongsToMachine = Boolean(job?.machine?.toString?.() === machine._id.toString());

    if (jobBelongsToMachine && job?.status === jobOrderStatuses.IN_PROGRESS) {
      try {
        await jobOrderService.pauseJobOrder(job._id.toString(), {
          source: 'system',
          reason: SHIFT_END_PAUSE_REASON,
          skipMachineEvent: true,
          now: shiftEndAt,
        });
      } catch (error) {
        console.error('[shift-sim] Job shift_end pause başarısız:', job.orderNo || jobId, error.message);
      }
    }

    try {
      await createMachineEvent(machine._id, {
        state: machineStatuses.IDLE,
        startedAt: shiftEndAt,
        source: 'system',
        ...(machine.currentJobOrder && { jobOrder: machine.currentJobOrder }),
        description: 'Vardiya bitti (shift_end)',
        metadata: {
          simulationRunId: runId,
          simulationSource: SOURCE,
          type: 'shift_end',
        },
      });
    } catch (error) {
      console.error('[shift-sim] Makine shift_end idle başarısız:', machine._id.toString(), error.message);
    }
  }
};

const startSimulator = async () => {
  await connectDatabase();

  if (CLEAR_BEFORE_START) {
    console.log('[shift-sim] Reset: önceki shift-sim verileri ve clock state temizleniyor...');
    await simulationClockService.resetShiftSimData();
  }

  const runContext = await simulationClockService.prepareShiftSimRun({
    sampleIntervalMs: SAMPLE_INTERVAL_MS,
  });

  currentShiftWindow = {
    startAt: runContext.shiftStartAt,
    endAt: runContext.shiftEndAt,
  };

  const shiftDurationMs = currentShiftWindow.endAt.getTime() - currentShiftWindow.startAt.getTime();
  if (!Number.isFinite(shiftDurationMs) || shiftDurationMs <= 0) {
    throw new Error('Shift penceresi hesaplanamadı (start/end geçersiz).');
  }

  const speed = shiftDurationMs / (REAL_DURATION_SECONDS * 1000);
  const runId = runContext.simulationRunId;
  const resumeAt = runContext.nextCursorAt;

  console.log(`[shift-sim] --- START ${new Date().toISOString()} run=${runId} ---`);
  console.log(
    `[shift-sim] Shift window: ${formatIso(currentShiftWindow.startAt)} → ${formatIso(
      currentShiftWindow.endAt,
    )} (${Math.round(shiftDurationMs / 60000)} dk)`,
  );
  console.log(`[shift-sim] Virtual day: ${runContext.virtualDay}`);
  if (resumeAt && resumeAt.getTime() > currentShiftWindow.startAt.getTime()) {
    console.log(`[shift-sim] Resume at: ${formatIso(resumeAt)}`);
  }
  console.log(
    `[shift-sim] Speed: ${speed.toFixed(2)}x (real ${REAL_DURATION_SECONDS}s, tick ${REAL_TICK_MS}ms, sample ${SAMPLE_INTERVAL_MS}ms)`,
  );

  await loadMachines();
  await ensurePlannedDowntimeUpToDate();

  const simStartMs = currentShiftWindow.startAt.getTime();
  const simEndMs = currentShiftWindow.endAt.getTime();

  let simCursorMs = Math.max(simStartMs, resumeAt?.getTime?.() || simStartMs);
  let lastWrittenAt = null;
  let remainderMs = 0;
  let lastProgressLogMs = simCursorMs;

  const intervalRef = setInterval(async () => {
    if (stopRequested) {
      clearInterval(intervalRef);
      if (lastWrittenAt) {
        try {
          await simulationClockService.updateShiftSimProgress({
            simulationRunId: runId,
            cursorAt: lastWrittenAt,
            status: 'paused',
          });
        } catch (error) {
          console.error('[shift-sim] Clock pause update başarısız:', error.message);
        }
      }
      console.log('[shift-sim] Stop requested, çıkılıyor.');
      process.exit(0);
    }

    try {
      await ensureMachinesUpToDate();
      await ensurePlannedDowntimeUpToDate();

      const advanceMs = REAL_TICK_MS * speed + remainderMs;
      const sampleCount = Math.floor(advanceMs / SAMPLE_INTERVAL_MS);
      remainderMs = advanceMs - sampleCount * SAMPLE_INTERVAL_MS;

      if (sampleCount <= 0) {
        return;
      }

      const docs = [];
      for (let i = 0; i < sampleCount; i += 1) {
        if (simCursorMs >= simEndMs) {
          break;
        }
        const timestamp = new Date(simCursorMs);
        for (const machine of machines) {
          docs.push(generateTelemetryPayload(machine, timestamp, runId));
        }
        simCursorMs += SAMPLE_INTERVAL_MS;
      }

      if (docs.length) {
        await MachineTelemetry.insertMany(docs, { ordered: false });
        lastWrittenAt = new Date(simCursorMs - SAMPLE_INTERVAL_MS);
      }

      if (simCursorMs - lastProgressLogMs >= 15 * 60 * 1000 || simCursorMs >= simEndMs) {
        const progress = ((simCursorMs - simStartMs) / (simEndMs - simStartMs)) * 100;
        console.log(
          `[shift-sim] Progress: ${progress.toFixed(1)}% sim=${new Date(simCursorMs).toISOString()} docs+${docs.length}`,
        );
        if (lastWrittenAt) {
          await simulationClockService.updateShiftSimProgress({
            simulationRunId: runId,
            cursorAt: lastWrittenAt,
            status: 'running',
          });
        }
        lastProgressLogMs = simCursorMs;
      }

      if (simCursorMs >= simEndMs) {
        clearInterval(intervalRef);
        const waitResult = await waitForProcessing(runId);
        if (!waitResult.ok) {
          console.log(
            `[shift-sim] Uyarı: Telemetry işleme ${waitResult.timeoutMs}ms içinde bitmedi; shift_end uygulanması tutarsız olabilir.`,
          );
        }

        await applyShiftEndPolicy({ shiftEndAt: currentShiftWindow.endAt, runId });
        await simulationClockService.updateShiftSimProgress({
          simulationRunId: runId,
          cursorAt: currentShiftWindow.endAt,
          status: 'completed',
        });
        console.log(`[shift-sim] --- DONE run=${runId} ---`);
        process.exit(0);
      }
    } catch (error) {
      clearInterval(intervalRef);
      console.error('[shift-sim] Hata:', error.message);
      process.exit(1);
    }
  }, REAL_TICK_MS);

  const shutdown = () => {
    stopRequested = true;
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startSimulator().catch((error) => {
  console.error('[shift-sim] Başlatılamadı:', error.message);
  process.exit(1);
});
