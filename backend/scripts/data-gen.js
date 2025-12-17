/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { connectDatabase } = require('../src/config/database');
require('../src/models');
const Machine = require('../src/domains/machines/models/machine-model');
const MachineEvent = require('../src/domains/machines/models/machine-event-model');
const MachineTelemetry = require('../src/domains/machines/models/machine-telemetry-model');
const machineStatuses = require('../src/constants/machine-statuses');

const INTERVAL_MS = Number(process.env.DATA_GEN_INTERVAL_MS) || 2000;
const MACHINE_REFRESH_MS = Math.max(
  INTERVAL_MS,
  Number(process.env.DATA_GEN_MACHINE_REFRESH_MS) || INTERVAL_MS,
);
const RUNNING_SIGNAL_DROP_PROB = Number(process.env.DATA_GEN_RUNNING_SIGNAL_DROP_PROB);
const RUNNING_SIGNAL_RECOVERY_PROB = Number(process.env.DATA_GEN_RUNNING_SIGNAL_RECOVERY_PROB);
const IDLE_SIGNAL_DROP_PROB = Number(process.env.DATA_GEN_IDLE_SIGNAL_DROP_PROB);
const IDLE_SIGNAL_RISE_PROB = Number(process.env.DATA_GEN_IDLE_SIGNAL_RISE_PROB);

const DEFAULT_RUNNING_SIGNAL_DROP_PROB = Number.isFinite(RUNNING_SIGNAL_DROP_PROB)
  ? RUNNING_SIGNAL_DROP_PROB
  : 0.03;
const DEFAULT_RUNNING_SIGNAL_RECOVERY_PROB = Number.isFinite(RUNNING_SIGNAL_RECOVERY_PROB)
  ? RUNNING_SIGNAL_RECOVERY_PROB
  : 0.95;
const DEFAULT_IDLE_SIGNAL_DROP_PROB = Number.isFinite(IDLE_SIGNAL_DROP_PROB)
  ? IDLE_SIGNAL_DROP_PROB
  : 0.7;
const DEFAULT_IDLE_SIGNAL_RISE_PROB = Number.isFinite(IDLE_SIGNAL_RISE_PROB)
  ? IDLE_SIGNAL_RISE_PROB
  : 0.15;

const PLANNED_STOPPED_MODE =
  process.env.DATA_GEN_PLANNED_STOPPED_MODE === undefined
    ? true
    : String(process.env.DATA_GEN_PLANNED_STOPPED_MODE).toLowerCase() === 'true';

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

const TRANSITION_WINDOW_MS = Number(process.env.DATA_GEN_TRANSITION_MS) || 10000;
const TRANSITION_TICKS = Math.max(1, Math.round(TRANSITION_WINDOW_MS / INTERVAL_MS));

const machineStates = new Map();
let machines = [];
let intervalRef;
let lastMachineRefresh = 0;

const randomDrift = (delta) => (Math.random() * 2 - 1) * delta;

const initializeMetric = (profile) => {
  const target = profile.base + randomDrift(profile.variance);
  return Number(Math.max(profile.min ?? target, target).toFixed(2));
};

const adjustMetric = (current, profile, transitionProgress = 1) => {
  if (typeof current !== 'number' || Number.isNaN(current)) {
    return initializeMetric(profile);
  }
  const target = profile.base + randomDrift(profile.variance);
  const baseSmoothing = profile.smoothing ?? 0.3;
  const boost = Math.max(0, (TRANSITION_TICKS - transitionProgress) / TRANSITION_TICKS);
  const effectiveSmoothing = Math.min(0.95, baseSmoothing + boost * 0.6);
  const next = current + (target - current) * effectiveSmoothing + randomDrift(profile.noise ?? 0.1);
  const bounded = profile.min !== undefined && next < profile.min ? profile.min : next;
  return Number(bounded.toFixed(2));
};

const pickNextSignal = (current, { hasActiveJob }) => {
  if (hasActiveJob) {
    if (current === 1) {
      return Math.random() < DEFAULT_RUNNING_SIGNAL_DROP_PROB ? 0 : 1;
    }
    return Math.random() < DEFAULT_RUNNING_SIGNAL_RECOVERY_PROB ? 1 : 0;
  }

  if (current === 1) {
    return Math.random() < DEFAULT_IDLE_SIGNAL_DROP_PROB ? 0 : 1;
  }
  return Math.random() < DEFAULT_IDLE_SIGNAL_RISE_PROB ? 1 : 0;
};

const ensureMachineState = (machine) => {
  const key = machine.id || machine._id.toString();
  if (!machineStates.has(key)) {
    const hasActiveJob = Boolean(machine.currentJobOrder);
    const isRunning = hasActiveJob && machine.status === machineStatuses.RUNNING;
    const mode = isRunning ? 'active' : 'idle';
    const profile = METRIC_PROFILES[mode];
    machineStates.set(key, {
      temperature: initializeMetric(profile.temperature),
      torque: initializeMetric(profile.torque),
      energy: initializeMetric(profile.energy),
      signal: isRunning ? 1 : 0,
      mode,
      transitionTicks: TRANSITION_TICKS,
    });
  }
  return machineStates.get(key);
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
  openPlanned.forEach((event) => {
    plannedMachines.add(event.machine.toString());
  });
  return plannedMachines;
};

const loadMachines = async () => {
  machines = await Machine.find({ isActive: true });
  machines.forEach((machine) => ensureMachineState(machine));
  lastMachineRefresh = Date.now();
  console.log(`Data-gen: ${machines.length} makine yüklendi.`);
};

const ensureMachinesUpToDate = async () => {
  const now = Date.now();
  if (!machines.length || now - lastMachineRefresh >= MACHINE_REFRESH_MS) {
    await loadMachines();
  }
};

const generateTelemetryPayload = (machine, { plannedDowntimeMachines } = {}) => {
  const state = ensureMachineState(machine);
  const machineKey = machine.id || machine._id.toString();
  const isPlannedStopped = plannedDowntimeMachines?.has(machineKey);
  if (isPlannedStopped) {
    state.mode = 'planned';
    state.signal = 0;
    state.temperature = 0;
    state.torque = 0;
    state.energy = 0;
    state.transitionTicks = TRANSITION_TICKS;
    return {
      machine: machine._id,
      timestamp: new Date(),
      signalValue: 0,
      metrics: {
        temperatureC: 0,
        torqueNm: 0,
        energyKwh: 0,
      },
      intervalMs: INTERVAL_MS,
      source: 'simulator',
    };
  }

  const hasActiveJob = Boolean(machine.currentJobOrder);
  const isRunning = hasActiveJob && machine.status === machineStatuses.RUNNING;
  const mode = isRunning ? 'active' : 'idle';
  const modeChanged = state.mode !== mode;
  if (modeChanged) {
    state.mode = mode;
    state.transitionTicks = 0;
  } else {
    state.transitionTicks = Math.min((state.transitionTicks || 0) + 1, TRANSITION_TICKS);
  }

  state.signal = pickNextSignal(state.signal, { hasActiveJob: isRunning });

  const transitionProgress = state.transitionTicks || TRANSITION_TICKS;
  state.temperature = adjustMetric(
    state.temperature,
    METRIC_PROFILES[mode].temperature,
    transitionProgress,
  );
  state.torque = adjustMetric(
    state.torque,
    METRIC_PROFILES[mode].torque,
    transitionProgress,
  );
  state.energy = adjustMetric(
    state.energy,
    METRIC_PROFILES[mode].energy,
    transitionProgress,
  );

  return {
    machine: machine._id,
    timestamp: new Date(),
    signalValue: state.signal,
    metrics: {
      temperatureC: Number(state.temperature.toFixed(2)),
      torqueNm: Number(state.torque.toFixed(2)),
      energyKwh: Number(state.energy.toFixed(2)),
    },
    intervalMs: INTERVAL_MS,
    source: 'simulator',
  };
};

const tick = async () => {
  if (!machines.length) {
    return;
  }

  try {
    await ensureMachinesUpToDate();
    if (!machines.length) {
      return;
    }
    const plannedDowntimeMachines = await loadOpenPlannedDowntimeMachineSet();
    const docs = machines.map((machine) =>
      generateTelemetryPayload(machine, { plannedDowntimeMachines }),
    );
    if (docs.length > 0) {
      await MachineTelemetry.insertMany(docs);
      console.log(`Data-gen: ${docs.length} telemetry kaydı eklendi.`);
    }
  } catch (error) {
    console.error('Data-gen: telemetry kaydı eklenemedi', error.message);
  }
};

const startIntervals = () => {
  intervalRef = setInterval(tick, INTERVAL_MS);
  tick();
};

const stopIntervals = () => {
  if (intervalRef) clearInterval(intervalRef);
};

const start = async () => {
  try {
    await connectDatabase();
    await loadMachines();
    startIntervals();
    console.log(
      `Data-gen başladı. Interval: ${INTERVAL_MS}ms, makine yenileme: ${MACHINE_REFRESH_MS}ms`,
    );
  } catch (error) {
    console.error('Data-gen başlatılamadı:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  console.log('Data-gen kapatılıyor...');
  stopIntervals();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Data-gen kapatılıyor...');
  stopIntervals();
  process.exit(0);
});

start();
