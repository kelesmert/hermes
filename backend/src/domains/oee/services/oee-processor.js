const path = require('path');
const fs = require('fs');
const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const Machine = require('../../machines/models/machine-model');
const JobOrder = require('../../production/models/job-order-model');
const OeeMachineState = require('../models/oee-machine-state-model');
const machineStatuses = require('../../../constants/machine-statuses');
const jobOrderStatuses = require('../../../constants/job-order-statuses');
const downtimeOrchestrator = require('../../downtime/services/downtime-orchestrator-service');

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

const PROCESSOR_TELEMETRY_SOURCE = String(process.env.OEE_PROCESSOR_TELEMETRY_SOURCE || 'shift-sim').trim();
const PROCESSOR_PROCESSES_ALL = PROCESSOR_TELEMETRY_SOURCE === 'all';
const PROCESSOR_DISABLE_SIGNAL_TIMEOUTS = PROCESSOR_TELEMETRY_SOURCE === 'shift-sim';

const ASSIGNED_JOB_STATUSES = [jobOrderStatuses.IN_PROGRESS, jobOrderStatuses.PAUSED];
const RUNNING_JOB_STATUSES = [jobOrderStatuses.IN_PROGRESS];

const buildJobFlagsByMachineId = async (machines) => {
  const jobIds = machines
    .map((machine) => machine.currentJobOrder)
    .filter(Boolean);

  if (!jobIds.length) {
    return new Map();
  }

  const jobs = await JobOrder.find({ _id: { $in: jobIds } })
    .select({ _id: 1, status: 1, machine: 1 })
    .lean();

  const jobById = new Map(jobs.map((job) => [job._id.toString(), job]));
  const flagsByMachineId = new Map();

  machines.forEach((machine) => {
    const machineId = machine._id.toString();
    const jobId = machine.currentJobOrder?.toString?.();
    const job = jobId ? jobById.get(jobId) : undefined;
    const jobMachineId = job?.machine?.toString?.();
    const jobBelongsToMachine = Boolean(jobMachineId && jobMachineId === machineId);
    const hasAssignedJob = Boolean(
      job && jobBelongsToMachine && ASSIGNED_JOB_STATUSES.includes(job.status),
    );
    const hasRunningJob = Boolean(
      job && jobBelongsToMachine && RUNNING_JOB_STATUSES.includes(job.status),
    );
    flagsByMachineId.set(machineId, {
      hasAssignedJob,
      hasRunningJob,
    });
  });

  return flagsByMachineId;
};

const openDowntimeEvent = async (state, startedAt, machine, { eventSource, eventMetadata } = {}) => {
  if (!machine) return;
  const event = await downtimeOrchestrator.openDowntimeFromTelemetry({
    machine,
    startedAt,
    reasonCode: defaultSignalRule.reasonCode,
    reasonCategory: defaultSignalRule.reasonCategory || 'unplanned',
    description: 'Otomatik tespit edilen duruş',
    eventSource,
    eventMetadata,
  });

  state.currentState = 'downtime';
  state.openEvent = event?._id;
};

const closeDowntimeEvent = async (
  state,
  endedAt,
  machine,
  hasRunningJob,
  { eventSource, eventMetadata } = {},
) => {
  if (machine) {
    await downtimeOrchestrator.closeDowntimeFromTelemetry({
      machine,
      endedAt,
      hasAssignedJob: hasRunningJob,
      eventSource,
      eventMetadata,
    });
  }
  state.currentState = 'running';
  state.openEvent = undefined;
  state.zeroSequenceStart = undefined;
};

const ensureMachineStatusForSignal = async (state, timestamp, machine, { hasAssignedJob }) => {
  if (!machine) return;
  let shouldSaveMachine = false;

  if (!hasAssignedJob) {
    if (machine.currentJobOrder) {
      machine.currentJobOrder = null;
      shouldSaveMachine = true;
    }
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

const buildEventContext = (telemetry) => {
  const simulationRunId = telemetry.simulationRunId;
  if (!simulationRunId) {
    return { eventSource: 'system', eventMetadata: undefined };
  }
  return {
    eventSource: 'simulator',
    eventMetadata: {
      simulationRunId,
      simulationSource: telemetry.source || 'simulator',
    },
  };
};

const processTelemetryBatch = async () => {
  const filter = {
    processedAt: { $exists: false },
    ...(PROCESSOR_PROCESSES_ALL ? {} : { source: PROCESSOR_TELEMETRY_SOURCE }),
  };

  const records = await MachineTelemetry.find(filter)
    .sort({ timestamp: 1 })
    .limit(batchSize)
    .lean();

  if (!records.length) {
    await handleSignalTimeouts();
    return;
  }

  const machineIdList = Array.from(
    new Set(records.map((item) => item.machine?.toString?.()).filter(Boolean)),
  );

  const machines = await Machine.find({ _id: { $in: machineIdList } }).select({
    currentJobOrder: 1,
    status: 1,
    lastEventAt: 1,
  });
  const machineMap = new Map(machines.map((machine) => [machine._id.toString(), machine]));
  const jobFlagsByMachineId = await buildJobFlagsByMachineId(machines);

  const existingStates = await OeeMachineState.find({ machine: { $in: machineIdList } });
  const stateMap = new Map(existingStates.map((state) => [state.machine.toString(), state]));
  machineIdList.forEach((machineId) => {
    if (!stateMap.has(machineId)) {
      stateMap.set(machineId, new OeeMachineState({ machine: machineId }));
    }
  });

  const processedIds = [];
  const touchedStates = new Set();
  const touchedMachines = new Set();
  const lastTimestampByMachine = new Map();

  // Eğer machine.currentJobOrder referansı artık aktif bir job'a işaret etmiyorsa (silinmiş/complete/cancel/pending),
  // stale referansı temizle ve makineyi idle'a çek.
  for (const machine of machines) {
    const machineId = machine._id.toString();
    if (!machine.currentJobOrder) continue;

    const jobFlags = jobFlagsByMachineId.get(machineId);
    const hasAssignedJob = jobFlags?.hasAssignedJob === true;
    if (hasAssignedJob) continue;

    machine.currentJobOrder = null;
    if (machine.status !== machineStatuses.IDLE) {
      machine.status = machineStatuses.IDLE;
    }
    machine.lastEventAt = machine.lastEventAt || new Date();
    touchedMachines.add(machineId);

    const state = stateMap.get(machineId);
    if (state) {
      state.currentState = 'running';
      state.openEvent = undefined;
      state.zeroSequenceStart = undefined;
      touchedStates.add(machineId);
    }
  }

  for (const telemetry of records) {
    try {
      const machineId = telemetry.machine?.toString?.();
      if (!machineId) continue;

      const machine = machineMap.get(machineId);
      const state = stateMap.get(machineId);
      if (!machine || !state) {
        processedIds.push(telemetry._id);
        continue;
      }

      const timestamp = telemetry.timestamp || telemetry.createdAt;
      const jobFlags = jobFlagsByMachineId.get(machineId);
      const hasAssignedJob = jobFlags?.hasAssignedJob === true;
      const hasRunningJob = jobFlags?.hasRunningJob === true;
      const shouldDetectDowntime =
        hasRunningJob &&
        ![machineStatuses.DOWNTIME, machineStatuses.MAINTENANCE].includes(machine.status);
      const { eventSource, eventMetadata } = buildEventContext(telemetry);

      if (telemetry.signalValue === 0) {
        if (!hasAssignedJob) {
          state.currentState = 'running';
          state.openEvent = undefined;
          state.zeroSequenceStart = undefined;
          if (machine.status !== machineStatuses.IDLE) {
            machine.status = machineStatuses.IDLE;
            machine.lastEventAt = timestamp;
            touchedMachines.add(machineId);
          }
        } else if (!hasRunningJob) {
          state.zeroSequenceStart = undefined;
        } else {
          if (!state.zeroSequenceStart) {
            state.zeroSequenceStart = timestamp;
          }
          const streakDuration = timestamp.getTime() - state.zeroSequenceStart.getTime();
          if (
            shouldDetectDowntime &&
            streakDuration >= defaultSignalRule.downtimeThresholdMs &&
            state.currentState !== 'downtime'
          ) {
            await openDowntimeEvent(state, state.zeroSequenceStart, machine, { eventSource, eventMetadata });
            machine.status = machineStatuses.DOWNTIME;
            machine.lastEventAt = state.zeroSequenceStart;
            touchedMachines.add(machineId);
          }
        }
      } else if (telemetry.signalValue === (defaultSignalRule.recoverySignal ?? 1)) {
        if (state.currentState === 'downtime') {
          await closeDowntimeEvent(state, timestamp, machine, hasRunningJob, { eventSource, eventMetadata });
          machine.status = hasRunningJob ? machineStatuses.RUNNING : machineStatuses.IDLE;
          machine.lastEventAt = timestamp;
          touchedMachines.add(machineId);
        } else {
          state.currentState = 'running';
          if (!hasAssignedJob) {
            state.openEvent = undefined;
            state.zeroSequenceStart = undefined;
            if (machine.status !== machineStatuses.IDLE) {
              machine.status = machineStatuses.IDLE;
              machine.lastEventAt = timestamp;
              touchedMachines.add(machineId);
            }
          }
        }
        state.zeroSequenceStart = undefined;
      } else {
        state.currentState = 'running';
        if (!hasAssignedJob) {
          state.openEvent = undefined;
          state.zeroSequenceStart = undefined;
          if (machine.status !== machineStatuses.IDLE) {
            machine.status = machineStatuses.IDLE;
            machine.lastEventAt = timestamp;
            touchedMachines.add(machineId);
          }
        }
      }

      state.lastSignalValue = telemetry.signalValue;
      state.lastSignalAt = timestamp;
      touchedStates.add(machineId);

      const lastTs = lastTimestampByMachine.get(machineId);
      if (!lastTs || lastTs.getTime() < timestamp.getTime()) {
        lastTimestampByMachine.set(machineId, timestamp);
      }

      processedIds.push(telemetry._id);
    } catch (error) {
      console.error('Telemetry kaydı işlenemedi:', telemetry._id?.toString?.() || '-', error.message);
    }
  }

  for (const machineId of touchedStates) {
    await stateMap.get(machineId).save();
  }

  for (const [machineId, timestamp] of lastTimestampByMachine.entries()) {
    const machine = machineMap.get(machineId);
    if (!machine) continue;
    if (!machine.lastEventAt || machine.lastEventAt.getTime() < timestamp.getTime()) {
      if ([machineStatuses.RUNNING, machineStatuses.IDLE].includes(machine.status)) {
        machine.lastEventAt = timestamp;
        touchedMachines.add(machineId);
      }
    }
  }

  for (const machineId of touchedMachines) {
    await machineMap.get(machineId).save();
  }

  if (processedIds.length) {
    await MachineTelemetry.updateMany(
      { _id: { $in: processedIds } },
      { $set: { processedAt: new Date() } },
    );
  }

  await handleSignalTimeouts();
};

const handleSignalTimeouts = async () => {
  if (!signalTimeoutMs || PROCESSOR_DISABLE_SIGNAL_TIMEOUTS) return;
  const threshold = new Date(Date.now() - signalTimeoutMs);
  const staleStates = await OeeMachineState.find({
    lastSignalAt: { $lt: threshold },
    currentState: { $ne: 'downtime' },
    lastSignalAt: { $exists: true },
  });

  if (!staleStates.length) {
    return;
  }

  const machineIds = Array.from(
    new Set(staleStates.map((item) => item.machine?.toString?.()).filter(Boolean)),
  );
  const machines = await Machine.find({ _id: { $in: machineIds } }).select({
    currentJobOrder: 1,
    status: 1,
    lastEventAt: 1,
  });
  const machineMap = new Map(machines.map((machine) => [machine._id.toString(), machine]));
  const jobFlagsByMachineId = await buildJobFlagsByMachineId(machines);

  for (const state of staleStates) {
    try {
      const machineId = state.machine?.toString?.();
      if (!machineId) {
        continue;
      }
      const startTime = state.lastSignalAt || threshold;
      const machine = machineMap.get(machineId);
      if (!machine) {
        continue;
      }
      const jobFlags = jobFlagsByMachineId.get(machineId);
      const hasAssignedJob = jobFlags?.hasAssignedJob === true;
      const hasRunningJob = jobFlags?.hasRunningJob === true;
      const shouldDetectDowntime =
        hasRunningJob &&
        ![machineStatuses.DOWNTIME, machineStatuses.MAINTENANCE].includes(machine.status);
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
