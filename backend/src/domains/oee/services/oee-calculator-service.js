const Machine = require('../../machines/models/machine-model');
const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const MachineEvent = require('../../machines/models/machine-event-model');
const ProductionEvent = require('../../production/models/production-event-model');
const JobOrder = require('../../production/models/job-order-model');
const AppError = require('../../../utils/app-error');
const oeeRulesService = require('./oee-rules-service');
const productionEventTypes = require('../../../constants/production-event-types');
const machineStatuses = require('../../../constants/machine-statuses');

const ISTANBUL_TIMEZONE = 'Europe/Istanbul';
const ISTANBUL_OFFSET_MINUTES = 180;
const SHIFT_START_HHMM = process.env.SHIFT_SIM_SHIFT_START || '07:00';
const SHIFT_END_HHMM = process.env.SHIFT_SIM_SHIFT_END || '18:00';

const TELEMETRY_SOURCES = {
  SHIFT_SIM: 'shift-sim',
  DATA_GEN: 'data-gen',
};

const LEGACY_DATA_GEN_SOURCES = ['data-gen', 'simulator'];

const ACTIVE_JOB_EVENTS = new Set([
  productionEventTypes.START,
  productionEventTypes.RESUME,
  productionEventTypes.AUTO_RESUME,
]);

const INACTIVE_JOB_EVENTS = new Set([
  productionEventTypes.PAUSE,
  productionEventTypes.AUTO_PAUSE,
  productionEventTypes.COMPLETE,
  productionEventTypes.CANCEL,
]);

const parseTime = (hhmm) => {
  const [hh, mm] = String(hhmm || '').split(':').map((item) => Number(item));
  return { hh, mm };
};

const getIstanbulYmd = (date) => {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISTANBUL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const [year, month, day] = formatted.split('-').map((item) => Number(item));
  return { year, month, day };
};

const computeDayWindowUtc = (ymd, startTime, endTime) => {
  const { hh: startH, mm: startM } = parseTime(startTime);
  const { hh: endH, mm: endM } = parseTime(endTime);

  const startAt = new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day, startH, startM, 0) -
      ISTANBUL_OFFSET_MINUTES * 60 * 1000,
  );
  const endAt = new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day, endH, endM, 0) -
      ISTANBUL_OFFSET_MINUTES * 60 * 1000,
  );

  if (endAt.getTime() <= startAt.getTime()) {
    endAt.setUTCDate(endAt.getUTCDate() + 1);
  }

  return { startAt, endAt };
};

const normalizeMode = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'range') return 'range';
  return 'shift';
};

const normalizeSource = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw || raw === 'auto') return 'auto';
  if (raw === TELEMETRY_SOURCES.SHIFT_SIM) return TELEMETRY_SOURCES.SHIFT_SIM;
  if (raw === TELEMETRY_SOURCES.DATA_GEN) return TELEMETRY_SOURCES.DATA_GEN;
  if (raw === 'simulator') return TELEMETRY_SOURCES.DATA_GEN;
  return 'auto';
};

const resolveAutoSource = async (machineId) => {
  const latest = await MachineTelemetry.findOne({
    machine: machineId,
    source: { $ne: 'seed' },
  })
    .sort({ timestamp: -1 })
    .select({ source: 1 })
    .lean();

  if (latest?.source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return TELEMETRY_SOURCES.SHIFT_SIM;
  }
  return TELEMETRY_SOURCES.DATA_GEN;
};

const buildSourceFilter = (source) => {
  if (source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return { source: TELEMETRY_SOURCES.SHIFT_SIM };
  }
  if (source === TELEMETRY_SOURCES.DATA_GEN) {
    return { source: { $in: LEGACY_DATA_GEN_SOURCES } };
  }
  return { source: { $ne: 'seed' } };
};

const parseShiftDate = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const resolveShiftWindow = async (machineId, shiftDate, source) => {
  let referenceDate = parseShiftDate(shiftDate);
  if (!referenceDate) {
    const latest = await MachineTelemetry.findOne({
      machine: machineId,
      ...buildSourceFilter(source),
    })
      .sort({ timestamp: -1 })
      .select({ timestamp: 1 })
      .lean();
    referenceDate = latest?.timestamp || new Date();
  }

  const ymd = getIstanbulYmd(referenceDate);
  const window = computeDayWindowUtc(ymd, SHIFT_START_HHMM, SHIFT_END_HHMM);
  return { windowStart: window.startAt, windowEnd: window.endAt };
};

const resolveRangeWindow = (from, to) => {
  if (!from || !to) {
    throw new AppError('Range modu icin from ve to zorunludur.', 400);
  }
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError('Gecersiz tarih formatı.', 400);
  }
  if (end.getTime() <= start.getTime()) {
    throw new AppError('Range modu icin to, from sonrasinda olmalidir.', 400);
  }
  return { windowStart: start, windowEnd: end };
};

const collectJobActiveIntervals = async (machineId, windowStart, windowEnd) => {
  const events = await ProductionEvent.find({
    machine: machineId,
    eventType: { $in: Array.from(new Set([...ACTIVE_JOB_EVENTS, ...INACTIVE_JOB_EVENTS])) },
    timestamp: { $lte: windowEnd },
  })
    .sort({ timestamp: 1 })
    .select({ eventType: 1, timestamp: 1 })
    .lean();

  const intervals = [];
  let active = false;
  let currentStart = null;

  for (const event of events) {
    const eventTime = event.timestamp;
    if (!eventTime) continue;

    if (eventTime.getTime() < windowStart.getTime()) {
      if (ACTIVE_JOB_EVENTS.has(event.eventType)) {
        active = true;
        currentStart = new Date(windowStart.getTime());
      }
      if (INACTIVE_JOB_EVENTS.has(event.eventType)) {
        active = false;
        currentStart = null;
      }
      continue;
    }

    if (eventTime.getTime() >= windowEnd.getTime()) {
      break;
    }

    if (ACTIVE_JOB_EVENTS.has(event.eventType)) {
      if (!active) {
        active = true;
        currentStart = new Date(eventTime.getTime());
      }
      continue;
    }

    if (INACTIVE_JOB_EVENTS.has(event.eventType)) {
      if (active && currentStart) {
        intervals.push({ start: currentStart, end: new Date(eventTime.getTime()) });
      }
      active = false;
      currentStart = null;
    }
  }

  if (active && currentStart) {
    intervals.push({ start: currentStart, end: new Date(windowEnd.getTime()) });
  }

  return intervals.filter((interval) => interval.end.getTime() > interval.start.getTime());
};

const sumIntervals = (intervals) =>
  intervals.reduce((total, interval) => total + (interval.end.getTime() - interval.start.getTime()), 0);

const sumOverlapMs = (intervals, rangeStart, rangeEnd) => {
  let total = 0;
  intervals.forEach((interval) => {
    const start = Math.max(interval.start.getTime(), rangeStart.getTime());
    const end = Math.min(interval.end.getTime(), rangeEnd.getTime());
    if (end > start) {
      total += end - start;
    }
  });
  return total;
};

const computeOperatingMs = (telemetry, activeIntervals) => {
  if (!activeIntervals.length) return 0;
  let operatingMs = 0;
  let intervalIndex = 0;
  for (const sample of telemetry) {
    const ts = sample.timestamp;
    if (!ts) continue;
    while (
      intervalIndex < activeIntervals.length &&
      ts.getTime() >= activeIntervals[intervalIndex].end.getTime()
    ) {
      intervalIndex += 1;
    }
    if (intervalIndex >= activeIntervals.length) {
      break;
    }
    const current = activeIntervals[intervalIndex];
    if (
      ts.getTime() >= current.start.getTime() &&
      ts.getTime() < current.end.getTime() &&
      sample.signalValue === 1
    ) {
      operatingMs += Math.max(0, Number(sample.intervalMs) || 0);
    }
  }
  return operatingMs;
};

const calculateOeeForMachine = async ({
  machineId,
  mode,
  shiftDate,
  from,
  to,
  source,
} = {}) => {
  if (!machineId) {
    throw new AppError('machineId zorunludur.', 400);
  }
  const machine = await Machine.findById(machineId).select({ _id: 1 });
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }

  const effectiveMode = normalizeMode(mode);
  const requestedSource = normalizeSource(source);
  const effectiveSource =
    requestedSource === 'auto' ? await resolveAutoSource(machine._id) : requestedSource;

  const { windowStart, windowEnd } =
    effectiveMode === 'range'
      ? resolveRangeWindow(from, to)
      : await resolveShiftWindow(machine._id, shiftDate, effectiveSource);

  const activeIntervals = await collectJobActiveIntervals(machine._id, windowStart, windowEnd);
  const basePlannedMs = sumIntervals(activeIntervals);

  const reasonCatalog = oeeRulesService.getReasonCatalog();
  const nonAffectingPlanned = new Set(
    reasonCatalog
      .filter((reason) => reason.category === 'planned' && reason.affectsOee === false)
      .map((reason) => reason.code),
  );

  const plannedDowntimeEvents = nonAffectingPlanned.size
    ? await MachineEvent.find({
        machine: machine._id,
        state: machineStatuses.DOWNTIME,
        reasonCategory: 'planned',
        reasonCode: { $in: Array.from(nonAffectingPlanned) },
        startedAt: { $lt: windowEnd },
        $or: [{ endedAt: { $exists: false } }, { endedAt: { $gt: windowStart } }],
      })
        .select({ startedAt: 1, endedAt: 1 })
        .lean()
    : [];

  let nonAffectingPlannedMs = 0;
  plannedDowntimeEvents.forEach((event) => {
    const eventStart = event.startedAt || windowStart;
    const eventEnd = event.endedAt || windowEnd;
    nonAffectingPlannedMs += sumOverlapMs(activeIntervals, eventStart, eventEnd);
  });

  const plannedTimeMs = Math.max(basePlannedMs - nonAffectingPlannedMs, 0);

  const telemetry = await MachineTelemetry.find({
    machine: machine._id,
    timestamp: { $gte: windowStart, $lt: windowEnd },
    ...buildSourceFilter(effectiveSource),
  })
    .sort({ timestamp: 1 })
    .select({ timestamp: 1, signalValue: 1, intervalMs: 1 })
    .lean();

  const operatingTimeMs = computeOperatingMs(telemetry, activeIntervals);

  const eventFilter = {
    machine: machine._id,
    timestamp: { $gte: windowStart, $lt: windowEnd },
    eventType: { $in: [productionEventTypes.PRODUCE, productionEventTypes.DEFECT] },
  };

  if (effectiveSource === TELEMETRY_SOURCES.SHIFT_SIM) {
    eventFilter['metadata.simulationSource'] = 'shift-sim';
    eventFilter.source = 'simulator';
  }

  const productionEvents = await ProductionEvent.find(eventFilter)
    .select({ jobOrder: 1, quantity: 1, qualityStatus: 1 })
    .lean();

  let totalCount = 0;
  let goodCount = 0;
  let defectCount = 0;

  const jobOrderIds = new Set();
  productionEvents.forEach((event) => {
    const qty = Math.max(0, Number(event.quantity) || 0);
    totalCount += qty;
    if (event.qualityStatus === 'defective') {
      defectCount += qty;
    } else {
      goodCount += qty;
    }
    if (event.jobOrder) {
      jobOrderIds.add(event.jobOrder.toString());
    }
  });

  let totalIdealMs = 0;
  if (jobOrderIds.size) {
    const jobOrders = await JobOrder.find({ _id: { $in: Array.from(jobOrderIds) } })
      .populate('part', 'idealCycleTime')
      .select({ part: 1, status: 1 })
      .lean();

    const idealByJob = new Map();
    jobOrders.forEach((job) => {
      const idealSeconds = Number(job.part?.idealCycleTime || 0);
      if (!Number.isFinite(idealSeconds) || idealSeconds <= 0) {
        return;
      }
      idealByJob.set(job._id.toString(), idealSeconds);
    });

    productionEvents.forEach((event) => {
      if (!event.jobOrder) return;
      const idealSeconds = idealByJob.get(event.jobOrder.toString());
      if (!idealSeconds) return;
      const qty = Math.max(0, Number(event.quantity) || 0);
      totalIdealMs += idealSeconds * 1000 * qty;
    });
  }

  const availability = plannedTimeMs > 0 ? operatingTimeMs / plannedTimeMs : null;
  const performance =
    operatingTimeMs > 0 && totalIdealMs > 0 ? totalIdealMs / operatingTimeMs : null;
  const quality = totalCount > 0 ? goodCount / totalCount : null;
  const oee =
    availability !== null && performance !== null && quality !== null
      ? availability * performance * quality
      : null;

  return {
    availability,
    performance,
    quality,
    oee,
    plannedTime: plannedTimeMs,
    operatingTime: operatingTimeMs,
    totalCount,
    goodCount,
    defectCount,
    windowStart,
    windowEnd,
    source: effectiveSource,
    mode: effectiveMode,
  };
};

module.exports = {
  calculateOeeForMachine,
};
