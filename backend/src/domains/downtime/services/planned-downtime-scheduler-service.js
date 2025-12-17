const PlannedDowntimeRule = require('../models/planned-downtime-rule-model');
const PlannedDowntimeRun = require('../models/planned-downtime-run-model');
const Machine = require('../../machines/models/machine-model');
const MachineEvent = require('../../machines/models/machine-event-model');
const JobOrder = require('../../production/models/job-order-model');
const OeeMachineState = require('../../oee/models/oee-machine-state-model');
const { createEvent: createMachineEvent } = require('../../machines/services/machine-event-service');
const { pauseJobOrder, resumeJobOrder } = require('../../production/services/job-order-service');
const machineStatuses = require('../../../constants/machine-statuses');

const ISTANBUL_OFFSET_MINUTES = 180;

const parseTime = (hhmm) => {
  const [hh, mm] = String(hhmm || '').split(':').map((item) => Number(item));
  return { hh, mm };
};

const getIstanbulYmd = (date) => {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const [year, month, day] = formatted.split('-').map((item) => Number(item));
  return { year, month, day };
};

const getIstanbulDayOfWeek = (date) => {
  const adjusted = new Date(date.getTime() + ISTANBUL_OFFSET_MINUTES * 60 * 1000);
  return adjusted.getUTCDay(); // 0-6
};

const computeDailyWindowUtc = (rule, now) => {
  const startTime = rule?.recurrence?.startTime;
  const endTime = rule?.recurrence?.endTime;
  if (!startTime || !endTime) return null;

  const { year, month, day } = getIstanbulYmd(now);
  const { hh: startH, mm: startM } = parseTime(startTime);
  const { hh: endH, mm: endM } = parseTime(endTime);

  const scheduledStartAt = new Date(
    Date.UTC(year, month - 1, day, startH, startM, 0) -
      ISTANBUL_OFFSET_MINUTES * 60 * 1000,
  );
  const scheduledEndAt = new Date(
    Date.UTC(year, month - 1, day, endH, endM, 0) - ISTANBUL_OFFSET_MINUTES * 60 * 1000,
  );

  if (scheduledEndAt.getTime() <= scheduledStartAt.getTime()) {
    return null;
  }

  return { scheduledStartAt, scheduledEndAt };
};

const createRunIfMissing = async ({ ruleId, machineId, scheduledStartAt, scheduledEndAt }) => {
  try {
    return await PlannedDowntimeRun.create({
      ruleId,
      machineId,
      scheduledStartAt,
      scheduledEndAt,
      status: 'scheduled',
    });
  } catch (error) {
    if (error?.code === 11000) {
      return null;
    }
    throw error;
  }
};

const markRun = async (run, patch) => {
  Object.assign(run, patch);
  await run.save();
  return run;
};

const endRunById = async (runId, endedAt, debug) => {
  if (!runId) return;
  const nextDebug =
    debug || endedAt
      ? {
          ...(debug || {}),
          ...(endedAt && { endedAt }),
        }
      : undefined;

  await PlannedDowntimeRun.findByIdAndUpdate(
    runId,
    {
      $set: {
        status: 'ended',
        ...(nextDebug && { debug: nextDebug }),
      },
    },
    { new: false },
  );
};

const getOpenMachineEvent = async (machineId) => {
  return MachineEvent.findOne({ machine: machineId, endedAt: { $exists: false } }).sort({
    startedAt: -1,
  });
};

const startPlannedRun = async ({ run, rule, machineId }) => {
  const now = new Date();
  const machine = await Machine.findById(machineId).select({
    currentJobOrder: 1,
    isActive: 1,
    status: 1,
  });

  if (!machine || machine.isActive === false) {
    await markRun(run, { status: 'skipped_no_active_job', debug: { reason: 'machine_inactive' } });
    return;
  }

  if (!machine.currentJobOrder) {
    await markRun(run, { status: 'skipped_no_active_job' });
    return;
  }

  const openEvent = await getOpenMachineEvent(machineId);
  if (openEvent?.state === machineStatuses.DOWNTIME && openEvent.reasonCategory === 'planned') {
    const openPriority = Number(openEvent.metadata?.plannedPriority ?? 0);
    if (openPriority > rule.priority) {
      await markRun(run, { status: 'skipped_conflict', debug: { reason: 'higher_priority_open' } });
      return;
    }
    if (openPriority === rule.priority && String(openEvent.metadata?.plannedRuleId) !== String(rule._id)) {
      await markRun(run, { status: 'skipped_conflict', debug: { reason: 'same_priority_conflict' } });
      return;
    }
    if (openPriority < rule.priority) {
      await endRunById(openEvent.metadata?.plannedRunId, now, { reason: 'preempted' });
    }
  }

  const jobOrder = await JobOrder.findById(machine.currentJobOrder).select({
    status: 1,
    orderNo: 1,
  });
  if (!jobOrder) {
    await markRun(run, { status: 'skipped_no_active_job', debug: { reason: 'job_not_found' } });
    return;
  }

  if (jobOrder.status === 'in_progress') {
    await pauseJobOrder(jobOrder._id, {
      source: 'system',
      reason: `planned:${rule.reasonCode}`,
      skipMachineEvent: true,
    });
  }

  const plannedEvent = await createMachineEvent(machineId, {
    state: machineStatuses.DOWNTIME,
    startedAt: now,
    reasonCode: rule.reasonCode,
    reasonCategory: 'planned',
    jobOrder: jobOrder._id,
    source: 'system',
    description: `Planlı duruş başladı: ${rule.reasonCode}`,
    metadata: {
      plannedRuleId: rule._id,
      plannedRunId: run._id,
      plannedPriority: rule.priority,
      plannedType: rule.type,
    },
  });

  await markRun(run, {
    status: 'started',
    machineEventId: plannedEvent._id,
    jobOrderId: jobOrder._id,
  });
};

const endPlannedRun = async (run) => {
  const now = new Date();

  await OeeMachineState.updateOne(
    { machine: run.machineId },
    { $unset: { zeroSequenceStart: 1 } },
    { upsert: true },
  );

  let resumeOk = false;
  if (run.jobOrderId) {
    try {
      await resumeJobOrder(run.jobOrderId, { source: 'system', skipMachineEvent: true });
      resumeOk = true;
    } catch (error) {
      resumeOk = false;
    }
  }

  await createMachineEvent(run.machineId, {
    state: resumeOk ? machineStatuses.RUNNING : machineStatuses.IDLE,
    startedAt: now,
    source: 'system',
    jobOrder: run.jobOrderId || undefined,
    description: resumeOk ? 'Planlı duruş bitti' : 'Planlı duruş bitti, resume edilemedi',
  });

  await markRun(run, { status: 'ended' });
};

const runSchedulerTick = async () => {
  const now = new Date();
  const istDay = getIstanbulDayOfWeek(now);

  const rules = await PlannedDowntimeRule.find({ isActive: true }).sort({ priority: -1, createdAt: 1 });

  const candidates = [];
  for (const rule of rules) {
    if (rule.type === 'one_time') {
      if (!rule.startAt || !rule.endAt) continue;
      if (now.getTime() < rule.startAt.getTime() || now.getTime() >= rule.endAt.getTime()) continue;

      for (const machineId of rule.machineIds || []) {
        candidates.push({
          rule,
          machineId,
          scheduledStartAt: rule.startAt,
          scheduledEndAt: rule.endAt,
        });
      }
      continue;
    }

    const window = computeDailyWindowUtc(rule, now);
    if (!window) continue;
    if (now.getTime() < window.scheduledStartAt.getTime() || now.getTime() >= window.scheduledEndAt.getTime()) {
      continue;
    }
    const days = rule?.recurrence?.daysOfWeek;
    if (Array.isArray(days) && days.length > 0 && !days.includes(istDay)) {
      continue;
    }

    for (const machineId of rule.machineIds || []) {
      candidates.push({ rule, machineId, ...window });
    }
  }

  for (const candidate of candidates) {
    const run = await createRunIfMissing({
      ruleId: candidate.rule._id,
      machineId: candidate.machineId,
      scheduledStartAt: candidate.scheduledStartAt,
      scheduledEndAt: candidate.scheduledEndAt,
    });
    if (!run) continue;
    await startPlannedRun({ run, rule: candidate.rule, machineId: candidate.machineId });
  }

  const dueToEnd = await PlannedDowntimeRun.find({
    status: 'started',
    scheduledEndAt: { $lte: now },
  }).limit(200);

  for (const run of dueToEnd) {
    await endPlannedRun(run);
  }
};

module.exports = {
  runSchedulerTick,
};
