/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { connectDatabase } = require('../src/config/database');
require('../src/models');
const Machine = require('../src/domains/machines/models/machine-model');
const MachineTelemetry = require('../src/domains/machines/models/machine-telemetry-model');

const INTERVAL_MS = Number(process.env.DATA_GEN_INTERVAL_MS) || 2000;
const MACHINE_REFRESH_MS = Number(process.env.DATA_GEN_MACHINE_REFRESH_MS) || 60000;
const TEMP_DELTA = Number(process.env.DATA_GEN_TEMP_DELTA) || 0.3;
const TORQUE_DELTA = Number(process.env.DATA_GEN_TORQUE_DELTA) || 3;
const ENERGY_DELTA = Number(process.env.DATA_GEN_ENERGY_DELTA) || 0.12;
const RUNNING_SIGNAL_DROP_PROB = Number(process.env.DATA_GEN_RUNNING_SIGNAL_DROP_PROB);
const RUNNING_SIGNAL_RECOVERY_PROB = Number(process.env.DATA_GEN_RUNNING_SIGNAL_RECOVERY_PROB);
const IDLE_SIGNAL_DROP_PROB = Number(process.env.DATA_GEN_IDLE_SIGNAL_DROP_PROB);
const IDLE_SIGNAL_RISE_PROB = Number(process.env.DATA_GEN_IDLE_SIGNAL_RISE_PROB);

const DEFAULT_RUNNING_SIGNAL_DROP_PROB = Number.isFinite(RUNNING_SIGNAL_DROP_PROB)
  ? RUNNING_SIGNAL_DROP_PROB
  : 0.01;
const DEFAULT_RUNNING_SIGNAL_RECOVERY_PROB = Number.isFinite(RUNNING_SIGNAL_RECOVERY_PROB)
  ? RUNNING_SIGNAL_RECOVERY_PROB
  : 0.9;
const DEFAULT_IDLE_SIGNAL_DROP_PROB = Number.isFinite(IDLE_SIGNAL_DROP_PROB)
  ? IDLE_SIGNAL_DROP_PROB
  : 0.2;
const DEFAULT_IDLE_SIGNAL_RISE_PROB = Number.isFinite(IDLE_SIGNAL_RISE_PROB)
  ? IDLE_SIGNAL_RISE_PROB
  : 0.1;

const machineStates = new Map();
let machines = [];
let intervalRef;
let refreshRef;

const randomDrift = (delta) => (Math.random() * 2 - 1) * delta;

const nudgeValue = (current, delta, min = null) => {
  let next = current + randomDrift(delta);
  if (min !== null && next < min) {
    next = min;
  }
  return Number(next.toFixed(2));
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
    machineStates.set(key, {
      temperature: 55 + Math.random() * 10,
      torque: 100 + Math.random() * 30,
      energy: 2 + Math.random() * 2,
      signal: 1,
    });
  }
  return machineStates.get(key);
};

const loadMachines = async () => {
  machines = await Machine.find({ isActive: true });
  machines.forEach((machine) => ensureMachineState(machine));
  console.log(`Data-gen: ${machines.length} makine yüklendi.`);
};

const generateTelemetryPayload = (machine) => {
  const state = ensureMachineState(machine);
  const hasActiveJob = Boolean(machine.currentJobOrder);
  state.signal = pickNextSignal(state.signal, { hasActiveJob });

  state.temperature = nudgeValue(state.temperature, TEMP_DELTA);
  state.torque = nudgeValue(state.torque, TORQUE_DELTA);
  state.energy = nudgeValue(state.energy, ENERGY_DELTA, 0.1);

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
    const docs = machines.map((machine) => generateTelemetryPayload(machine));
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
  refreshRef = setInterval(loadMachines, MACHINE_REFRESH_MS);
  tick();
};

const stopIntervals = () => {
  if (intervalRef) clearInterval(intervalRef);
  if (refreshRef) clearInterval(refreshRef);
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
