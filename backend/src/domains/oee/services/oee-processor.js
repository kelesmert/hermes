const path = require('path');
const fs = require('fs');
const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const MachineEvent = require('../../machines/models/machine-event-model');
const Machine = require('../../machines/models/machine-model');
const OeeMachineState = require('../models/oee-machine-state-model');
const machineStatuses = require('../../../constants/machine-statuses');

const CONFIG_PATH = path.join(__dirname, '../config/oee-rules.json');

const loadRules = () => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('OEE konfigürasyonu okunamadı, varsayılan değerler kullanılacak.', error.message);
    return {
      signals: {
        default: {
          downtimeThresholdMs: 30000,
          recoverySignal: 1,
          reasonCode: 'unplanned_stop',
        },
      },
      aggregation: {
        pollIntervalMs: 2000,
        batchSize: 200,
      },
    };
  }
};

const rules = loadRules();
const defaultSignalRule = rules.signals?.default || {
  downtimeThresholdMs: 30000,
  recoverySignal: 1,
  reasonCode: 'unplanned_stop',
};
const aggregationRules = rules.aggregation || { pollIntervalMs: 2000, batchSize: 200 };
const signalTimeoutMs =
  defaultSignalRule.signalTimeoutMs === undefined ? 10000 : defaultSignalRule.signalTimeoutMs;

const pollIntervalMs = aggregationRules.pollIntervalMs || 2000;
const batchSize = aggregationRules.batchSize || 200;

const getMachineState = async (machineId) => {
  let state = await OeeMachineState.findOne({ machine: machineId });
  if (!state) {
    state = await OeeMachineState.create({ machine: machineId });
  }
  return state;
};

const openDowntimeEvent = async (state, startedAt, machine) => {
  if (!machine) return;
  const event = await MachineEvent.create({
    machine: machine._id,
    state: machineStatuses.DOWNTIME,
    startedAt,
    reasonCode: defaultSignalRule.reasonCode,
    description: 'Otomatik tespit edilen duruş',
    source: 'system',
  });

  machine.status = machineStatuses.DOWNTIME;
  machine.lastEventAt = startedAt;
  await machine.save();

  state.currentState = 'downtime';
  state.openEvent = event._id;
};

const closeDowntimeEvent = async (state, endedAt, machine, hasAssignedJob) => {
  if (state.openEvent) {
    await MachineEvent.findByIdAndUpdate(state.openEvent, { endedAt });
  }
  if (machine) {
    machine.status = hasAssignedJob ? machineStatuses.RUNNING : machineStatuses.IDLE;
    machine.lastEventAt = endedAt;
    await machine.save();
  }
  state.currentState = 'running';
  state.openEvent = undefined;
  state.zeroSequenceStart = undefined;
};

const ensureMachineStatusForSignal = async (state, timestamp, machine, { hasAssignedJob }) => {
  if (!machine) return;
  let shouldSaveMachine = false;

  if (!hasAssignedJob) {
    if (machine.status !== machineStatuses.IDLE) {
      machine.status = machineStatuses.IDLE;
      shouldSaveMachine = true;
    }
    if (!machine.lastEventAt || machine.lastEventAt.getTime() !== timestamp.getTime()) {
      machine.lastEventAt = timestamp;
      shouldSaveMachine = true;
    }
  } else if (machine.status === machineStatuses.RUNNING) {
    if (!machine.lastEventAt || machine.lastEventAt.getTime() < timestamp.getTime()) {
      machine.lastEventAt = timestamp;
      shouldSaveMachine = true;
    }
  }

  if (shouldSaveMachine) {
    await machine.save();
  }

  state.currentState = 'running';
  if (!hasAssignedJob) {
    state.openEvent = undefined;
    state.zeroSequenceStart = undefined;
  }
};

const processTelemetryRecord = async (telemetry) => {
  const state = await getMachineState(telemetry.machine);
  const machine = await Machine.findById(telemetry.machine);
  if (!machine) {
    return;
  }
  const timestamp = telemetry.timestamp || telemetry.createdAt;
  const hasAssignedJob = Boolean(machine.currentJobOrder);
  const shouldDetectDowntime = hasAssignedJob && machine.status === machineStatuses.RUNNING;

  if (telemetry.signalValue === 0) {
    if (!state.zeroSequenceStart) {
      state.zeroSequenceStart = timestamp;
    }
    const streakDuration = timestamp.getTime() - state.zeroSequenceStart.getTime();
    if (
      shouldDetectDowntime &&
      streakDuration >= defaultSignalRule.downtimeThresholdMs &&
      state.currentState !== 'downtime'
    ) {
      await openDowntimeEvent(state, state.zeroSequenceStart, machine);
    }
  } else if (telemetry.signalValue === (defaultSignalRule.recoverySignal ?? 1)) {
    if (state.currentState === 'downtime') {
      await closeDowntimeEvent(state, timestamp, machine, hasAssignedJob);
    } else {
      await ensureMachineStatusForSignal(state, timestamp, machine, { hasAssignedJob });
    }
    state.zeroSequenceStart = undefined;
  } else {
    await ensureMachineStatusForSignal(state, timestamp, machine, { hasAssignedJob });
  }

  state.lastSignalValue = telemetry.signalValue;
  state.lastSignalAt = timestamp;
  await state.save();

  telemetry.processedAt = new Date();
  await telemetry.save();
};

const processTelemetryBatch = async () => {
  const records = await MachineTelemetry.find({ processedAt: { $exists: false } })
    .sort({ timestamp: 1 })
    .limit(batchSize);

  if (!records.length) {
    await handleSignalTimeouts();
    return;
  }

  for (const telemetry of records) {
    try {
      await processTelemetryRecord(telemetry);
    } catch (error) {
      console.error('Telemetry kaydı işlenemedi:', telemetry.id, error.message);
    }
  }

  await handleSignalTimeouts();
};

const handleSignalTimeouts = async () => {
  if (!signalTimeoutMs) return;
  const threshold = new Date(Date.now() - signalTimeoutMs);
  const staleStates = await OeeMachineState.find({
    lastSignalAt: { $lt: threshold },
    currentState: { $ne: 'downtime' },
    lastSignalAt: { $exists: true },
  });

  for (const state of staleStates) {
    try {
      const startTime = state.lastSignalAt || threshold;
      const machine = await Machine.findById(state.machine);
      if (!machine) {
        continue;
      }
      const hasAssignedJob = Boolean(machine.currentJobOrder);
      const shouldDetectDowntime =
        hasAssignedJob && machine.status === machineStatuses.RUNNING;
      if (!shouldDetectDowntime) {
        await ensureMachineStatusForSignal(state, new Date(), machine, { hasAssignedJob });
        await state.save();
        continue;
      }
      state.zeroSequenceStart = startTime;
      await openDowntimeEvent(state, startTime, machine);
      await state.save();
    } catch (error) {
      console.error('Sinyal zaman aşımı duruşu açılamadı:', state.machine, error.message);
    }
  }
};

module.exports = {
  pollIntervalMs,
  processTelemetryBatch,
};
