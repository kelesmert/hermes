const Machine = require('../../machines/models/machine-model');
const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const MachineEvent = require('../../machines/models/machine-event-model');
const ProductionEvent = require('../../production/models/production-event-model');
const JobOrder = require('../../production/models/job-order-model');
const AppError = require('../../../utils/app-error');
const oeeRulesService = require('./oee-rules-service');
const simulationClockService = require('../../simulations/services/simulation-clock-service');
const productionEventTypes = require('../../../constants/production-event-types');
const machineStatuses = require('../../../constants/machine-statuses');

const TELEMETRY_SOURCES = {
  SHIFT_SIM: 'shift-sim',
  DATA_GEN: 'data-gen',
  MOCK_BATCH: 'mock-batch',
};

const LEGACY_DATA_GEN_SOURCES = ['data-gen', 'simulator'];

const ACTIVE_JOB_EVENTS = new Set([
  productionEventTypes.START,
  productionEventTypes.RESUME,
  productionEventTypes.AUTO_RESUME,
]);

const INACTIVE_JOB_EVENTS = new Set([
  productionEventTypes.COMPLETE,
  productionEventTypes.CANCEL,
]);

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
  if (raw === TELEMETRY_SOURCES.MOCK_BATCH) return TELEMETRY_SOURCES.MOCK_BATCH;
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
  if (latest?.source === TELEMETRY_SOURCES.MOCK_BATCH) {
    return TELEMETRY_SOURCES.MOCK_BATCH;
  }
  return TELEMETRY_SOURCES.DATA_GEN;
};

const buildSourceFilter = (source) => {
  if (source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return { source: TELEMETRY_SOURCES.SHIFT_SIM };
  }
  if (source === TELEMETRY_SOURCES.MOCK_BATCH) {
    return { source: TELEMETRY_SOURCES.MOCK_BATCH };
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
  const baseWindow = await simulationClockService.getShiftWindowForDate(referenceDate, {
    includeWeekends: true,
  });
  if (!baseWindow) {
    return { windowStart: referenceDate, windowEnd: referenceDate, shiftWindows: [] };
  }
  const weekdayWindow = await simulationClockService.getShiftWindowForDate(referenceDate, {
    includeWeekends: false,
  });
  const shiftWindows = weekdayWindow
    ? [{ start: weekdayWindow.shiftStartAt, end: weekdayWindow.shiftEndAt }]
    : [];
  return {
    windowStart: baseWindow.shiftStartAt,
    windowEnd: baseWindow.shiftEndAt,
    shiftWindows,
  };
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

const collectJobActiveIntervals = async (machineId, windowStart, windowEnd, source) => {
  const eventFilter = {
    machine: machineId,
    eventType: { $in: Array.from(new Set([...ACTIVE_JOB_EVENTS, ...INACTIVE_JOB_EVENTS])) },
    timestamp: { $lte: windowEnd },
  };
  if (
    source === TELEMETRY_SOURCES.SHIFT_SIM ||
    source === TELEMETRY_SOURCES.DATA_GEN ||
    source === TELEMETRY_SOURCES.MOCK_BATCH
  ) {
    eventFilter['metadata.simulationSource'] = source;
  }

  const events = await ProductionEvent.find(eventFilter)
    .sort({ timestamp: 1 })
    .select({ eventType: 1, timestamp: 1 })
    .lean();

  const eventPriority = (eventType) => {
    if (INACTIVE_JOB_EVENTS.has(eventType)) return 0;
    if (ACTIVE_JOB_EVENTS.has(eventType)) return 1;
    return 2;
  };

  events.sort((a, b) => {
    const aTime = a.timestamp ? a.timestamp.getTime() : 0;
    const bTime = b.timestamp ? b.timestamp.getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;
    return eventPriority(a.eventType) - eventPriority(b.eventType);
  });

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

const intersectIntervals = (intervals, windows) => {
  if (!intervals.length || !windows.length) return [];
  const result = [];
  intervals.forEach((interval) => {
    windows.forEach((window) => {
      const start = Math.max(interval.start.getTime(), window.start.getTime());
      const end = Math.min(interval.end.getTime(), window.end.getTime());
      if (end > start) {
        result.push({ start: new Date(start), end: new Date(end) });
      }
    });
  });
  return result.sort((a, b) => a.start.getTime() - b.start.getTime());
};

const buildShiftWindowsForRange = async (windowStart, windowEnd) => {
  return simulationClockService.getShiftWindowsForRange(windowStart, windowEnd, {
    includeWeekends: false,
  });
};

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

const isWithinWindows = (timestamp, windows) => {
  if (!windows.length) return false;
  return windows.some(
    (window) =>
      timestamp.getTime() >= window.start.getTime() && timestamp.getTime() < window.end.getTime(),
  );
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

  let windowStart;
  let windowEnd;
  let shiftWindows = [];
  if (effectiveMode === 'range') {
    const rangeWindow = resolveRangeWindow(from, to);
    windowStart = rangeWindow.windowStart;
    windowEnd = rangeWindow.windowEnd;
    shiftWindows = await buildShiftWindowsForRange(windowStart, windowEnd);
  } else {
    const shiftWindow = await resolveShiftWindow(machine._id, shiftDate, effectiveSource);
    windowStart = shiftWindow.windowStart;
    windowEnd = shiftWindow.windowEnd;
    shiftWindows = shiftWindow.shiftWindows || [];
  }

  const activeIntervals = await collectJobActiveIntervals(machine._id, windowStart, windowEnd, effectiveSource);
  const plannedIntervals = intersectIntervals(activeIntervals, shiftWindows);
  const basePlannedMs = sumIntervals(plannedIntervals);

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
    nonAffectingPlannedMs += sumOverlapMs(plannedIntervals, eventStart, eventEnd);
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

  const operatingTimeMs = computeOperatingMs(telemetry, plannedIntervals);

  const eventFilter = {
    machine: machine._id,
    timestamp: { $gte: windowStart, $lt: windowEnd },
    eventType: { $in: [productionEventTypes.PRODUCE, productionEventTypes.DEFECT] },
  };

  if (effectiveSource === TELEMETRY_SOURCES.SHIFT_SIM) {
    eventFilter['metadata.simulationSource'] = 'shift-sim';
    eventFilter.source = 'simulator';
  } else if (effectiveSource === TELEMETRY_SOURCES.DATA_GEN) {
    eventFilter['metadata.simulationSource'] = 'data-gen';
  } else if (effectiveSource === TELEMETRY_SOURCES.MOCK_BATCH) {
    eventFilter['metadata.simulationSource'] = 'mock-batch';
    eventFilter.source = 'simulator';
  }

  const productionEvents = await ProductionEvent.find(eventFilter)
    .select({ jobOrder: 1, quantity: 1, qualityStatus: 1, timestamp: 1 })
    .lean();

  let totalCount = 0;
  let goodCount = 0;
  let defectCount = 0;

  const jobOrderIds = new Set();
  productionEvents.forEach((event) => {
    if (!isWithinWindows(event.timestamp, shiftWindows)) {
      return;
    }
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
