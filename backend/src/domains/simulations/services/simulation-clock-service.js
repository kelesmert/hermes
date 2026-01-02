const SimulationState = require('../models/simulation-state-model');
const MachineTelemetry = require('../../machines/models/machine-telemetry-model');
const MachineEvent = require('../../machines/models/machine-event-model');
const ProductionEvent = require('../../production/models/production-event-model');
const OeeMachineState = require('../../oee/models/oee-machine-state-model');

const SHIFT_SIM_KEY = 'shift-sim';
const ISTANBUL_TIMEZONE = 'Europe/Istanbul';
const ISTANBUL_OFFSET_MINUTES = 180;

const DEFAULT_EPOCH_DATE = '2025-01-01';
const DEFAULT_SHIFT_START = '07:00';
const DEFAULT_SHIFT_END = '18:00';

const isWeekdayYmd = (ymd) => {
  const date = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day, 12, 0, 0));
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
};

const parseTime = (hhmm) => {
  const [hh, mm] = String(hhmm || '').split(':').map((item) => Number(item));
  return { hh, mm };
};

const parseYmd = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return { year, month, day };
};

const formatYmd = ({ year, month, day }) =>
  `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const addDaysToYmd = (ymd, days) => {
  const base = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + days);
  return {
    year: base.getUTCFullYear(),
    month: base.getUTCMonth() + 1,
    day: base.getUTCDate(),
  };
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

  const shiftStartAt = new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day, startH, startM, 0) -
      ISTANBUL_OFFSET_MINUTES * 60 * 1000,
  );
  const shiftEndAt = new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day, endH, endM, 0) -
      ISTANBUL_OFFSET_MINUTES * 60 * 1000,
  );

  if (shiftEndAt.getTime() <= shiftStartAt.getTime()) {
    shiftEndAt.setUTCDate(shiftEndAt.getUTCDate() + 1);
  }

  return { shiftStartAt, shiftEndAt };
};

const resolveShiftSchedule = async ({ shiftStart, shiftEnd, timezone } = {}) => {
  const state = await ensureShiftSimState();
  return {
    shiftStart: shiftStart || state.shiftStart || process.env.SHIFT_SIM_SHIFT_START || DEFAULT_SHIFT_START,
    shiftEnd: shiftEnd || state.shiftEnd || process.env.SHIFT_SIM_SHIFT_END || DEFAULT_SHIFT_END,
    timezone: timezone || state.timezone || ISTANBUL_TIMEZONE,
  };
};

const getShiftWindowForDate = async (
  referenceDate,
  { shiftStart, shiftEnd, includeWeekends = false } = {},
) => {
  if (!referenceDate) return null;
  const schedule = await resolveShiftSchedule({ shiftStart, shiftEnd });
  const ymd = getIstanbulYmd(referenceDate);
  if (!includeWeekends && !isWeekdayYmd(ymd)) {
    return null;
  }
  const window = computeDayWindowUtc(ymd, schedule.shiftStart, schedule.shiftEnd);
  return { ...window, shiftStart: schedule.shiftStart, shiftEnd: schedule.shiftEnd };
};

const getShiftWindowsForRange = async (
  rangeStart,
  rangeEnd,
  { shiftStart, shiftEnd, includeWeekends = false } = {},
) => {
  if (!rangeStart || !rangeEnd) return [];
  const schedule = await resolveShiftSchedule({ shiftStart, shiftEnd });
  const startYmd = getIstanbulYmd(rangeStart);
  const endYmd = getIstanbulYmd(rangeEnd);
  let cursor = { ...startYmd };
  const windows = [];

  const toMiddayUtc = (ymd) => new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day, 12, 0, 0));
  const endMidday = toMiddayUtc(endYmd);

  while (toMiddayUtc(cursor) <= endMidday) {
    if (includeWeekends || isWeekdayYmd(cursor)) {
      const window = computeDayWindowUtc(cursor, schedule.shiftStart, schedule.shiftEnd);
      const startAt = new Date(Math.max(window.shiftStartAt.getTime(), rangeStart.getTime()));
      const endAt = new Date(Math.min(window.shiftEndAt.getTime(), rangeEnd.getTime()));
      if (endAt.getTime() > startAt.getTime()) {
        windows.push({ start: startAt, end: endAt });
      }
    }
    cursor = addDaysToYmd(cursor, 1);
  }

  return windows;
};

const computeWindowForVirtualDay = (virtualDay, shiftStart, shiftEnd) => {
  const ymd = parseYmd(virtualDay);
  if (!ymd) return null;
  return computeDayWindowUtc(ymd, shiftStart, shiftEnd);
};

const buildShiftSimRunId = (shiftStartAt) => {
  const ymd = getIstanbulYmd(shiftStartAt);
  const y = `${ymd.year}`.padStart(4, '0');
  const m = `${ymd.month}`.padStart(2, '0');
  const d = `${ymd.day}`.padStart(2, '0');
  const suffix = Math.random().toString(16).slice(2, 8);
  return `SS-${y}${m}${d}-${suffix}`;
};

const getEpochDateFromEnv = () => {
  const parsed = parseYmd(process.env.SHIFT_SIM_EPOCH_DATE);
  if (parsed) return formatYmd(parsed);
  return DEFAULT_EPOCH_DATE;
};

const findLatestShiftSimTelemetry = async ({ simulationRunId } = {}) => {
  const filter = { source: 'shift-sim' };
  if (simulationRunId) {
    filter.simulationRunId = simulationRunId;
  }
  return MachineTelemetry.findOne(filter)
    .sort({ timestamp: -1 })
    .select({ timestamp: 1, simulationRunId: 1 })
    .lean();
};

const ensureShiftSimState = async ({
  timezone = ISTANBUL_TIMEZONE,
  shiftStart,
  shiftEnd,
  epochDate,
} = {}) => {
  const resolvedEpoch = epochDate || getEpochDateFromEnv();
  const resolvedShiftStart = shiftStart || process.env.SHIFT_SIM_SHIFT_START || DEFAULT_SHIFT_START;
  const resolvedShiftEnd = shiftEnd || process.env.SHIFT_SIM_SHIFT_END || DEFAULT_SHIFT_END;

  let state = await SimulationState.findOne({ key: SHIFT_SIM_KEY });
  if (state) {
    return state;
  }

  const latest = await findLatestShiftSimTelemetry();
  const inferredVirtualDay = latest?.timestamp ? formatYmd(getIstanbulYmd(latest.timestamp)) : resolvedEpoch;
  const window = computeWindowForVirtualDay(inferredVirtualDay, resolvedShiftStart, resolvedShiftEnd);
  if (!window) {
    throw new Error('SHIFT_SIM_EPOCH_DATE formatı geçersiz. Beklenen: YYYY-MM-DD');
  }

  const insertDoc = {
    key: SHIFT_SIM_KEY,
    timezone,
    epochDate: resolvedEpoch,
    shiftStart: resolvedShiftStart,
    shiftEnd: resolvedShiftEnd,
    virtualDay: inferredVirtualDay,
    shiftStartAt: window.shiftStartAt,
    shiftEndAt: window.shiftEndAt,
    cursorAt: latest?.timestamp || null,
    simulationRunId: latest?.simulationRunId || buildShiftSimRunId(window.shiftStartAt),
    status: 'idle',
    ...(latest?.simulationRunId ? { metadata: { inferredFromTelemetry: true } } : {}),
  };

  state = await SimulationState.findOneAndUpdate(
    { key: SHIFT_SIM_KEY },
    { $setOnInsert: insertDoc },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return state;
};

const syncShiftSimStateWithDb = async (state) => {
  if (!state) return null;

  const [latestForRun, latestOverall] = await Promise.all([
    state.simulationRunId ? findLatestShiftSimTelemetry({ simulationRunId: state.simulationRunId }) : null,
    findLatestShiftSimTelemetry(),
  ]);
  const latest = latestForRun?.timestamp ? latestForRun : latestOverall;
  if (!latest?.timestamp) return state;

  const stateCursorMs = state.cursorAt?.getTime?.() || 0;
  const dbCursorMs = latest.timestamp.getTime();

  if (dbCursorMs > stateCursorMs) {
    console.warn(
      `[shift-sim] Simulation clock state cursorAt geride. state=${stateCursorMs || '-'} db=${dbCursorMs} run=${state.simulationRunId || '-'}`,
    );
    state.cursorAt = latest.timestamp;
    if (latest.simulationRunId && latest.simulationRunId !== state.simulationRunId) {
      state.simulationRunId = latest.simulationRunId;
    }

    const inferredDay = formatYmd(getIstanbulYmd(latest.timestamp));
    if (inferredDay && inferredDay !== state.virtualDay) {
      state.virtualDay = inferredDay;
      const window = computeWindowForVirtualDay(inferredDay, state.shiftStart, state.shiftEnd);
      if (window) {
        state.shiftStartAt = window.shiftStartAt;
        state.shiftEndAt = window.shiftEndAt;
      }
    }

    await state.save();
  }

  return state;
};

const prepareShiftSimRun = async ({ sampleIntervalMs } = {}) => {
  const safeIntervalMs = Math.max(100, Number(sampleIntervalMs) || 2000);

  let state = await ensureShiftSimState();
  state = await syncShiftSimStateWithDb(state);

  const resolvedVirtualDay =
    (parseYmd(state.virtualDay) && state.virtualDay) || getEpochDateFromEnv();
  if (resolvedVirtualDay !== state.virtualDay) state.virtualDay = resolvedVirtualDay;

  const window = computeWindowForVirtualDay(state.virtualDay, state.shiftStart, state.shiftEnd);
  if (!window) {
    throw new Error('Shift sim window hesaplanamadı.');
  }
  state.shiftStartAt = window.shiftStartAt;
  state.shiftEndAt = window.shiftEndAt;

  if (state.cursorAt && state.cursorAt.getTime() >= state.shiftEndAt.getTime()) {
    const baseYmd = parseYmd(state.virtualDay) || parseYmd(getEpochDateFromEnv());
    const nextDay = addDaysToYmd(baseYmd, 1);
    state.virtualDay = formatYmd(nextDay);
    const nextWindow = computeWindowForVirtualDay(state.virtualDay, state.shiftStart, state.shiftEnd);
    if (!nextWindow) {
      throw new Error('Shift sim next day window hesaplanamadı.');
    }
    state.shiftStartAt = nextWindow.shiftStartAt;
    state.shiftEndAt = nextWindow.shiftEndAt;
    state.cursorAt = null;
    state.simulationRunId = buildShiftSimRunId(state.shiftStartAt);
    state.status = 'idle';
  }

  const nextCursorAt = state.cursorAt
    ? new Date(state.cursorAt.getTime() + safeIntervalMs)
    : new Date(state.shiftStartAt.getTime());

  state.status = 'running';
  await state.save();

  return {
    state,
    simulationRunId: state.simulationRunId,
    virtualDay: state.virtualDay,
    shiftStartAt: state.shiftStartAt,
    shiftEndAt: state.shiftEndAt,
    nextCursorAt,
    sampleIntervalMs: safeIntervalMs,
  };
};

const updateShiftSimProgress = async ({ simulationRunId, cursorAt, status } = {}) => {
  if (!cursorAt) return null;
  const state = await SimulationState.findOne({ key: SHIFT_SIM_KEY });
  if (!state) return null;
  if (simulationRunId && state.simulationRunId && simulationRunId !== state.simulationRunId) {
    return state;
  }
  const cursorMs = cursorAt.getTime();
  const prevMs = state.cursorAt?.getTime?.() || 0;
  if (cursorMs <= prevMs) {
    if (status && state.status !== status) {
      state.status = status;
      await state.save();
    }
    return state;
  }
  state.cursorAt = cursorAt;
  if (status) {
    state.status = status;
  }
  await state.save();
  return state;
};

const resetShiftSimClock = async () => {
  await SimulationState.deleteOne({ key: SHIFT_SIM_KEY });
  return { ok: true };
};

const resetShiftSimData = async () => {
  const telemetryResult = await MachineTelemetry.deleteMany({ source: 'shift-sim' });

  const metadataMatch = {
    $or: [
      { 'metadata.simulationSource': 'shift-sim' },
      { 'metadata.simulationRunId': { $regex: /^SS-/ } },
    ],
  };

  const [machineEventResult, productionEventResult] = await Promise.all([
    MachineEvent.deleteMany(metadataMatch),
    ProductionEvent.deleteMany(metadataMatch),
  ]);

  await OeeMachineState.updateMany(
    {},
    {
      $set: { currentState: 'running' },
      $unset: { openEvent: 1, zeroSequenceStart: 1, lastSignalValue: 1, lastSignalAt: 1 },
    },
  );

  await resetShiftSimClock();

  return {
    ok: true,
    deleted: {
      telemetry: telemetryResult?.deletedCount || 0,
      machineEvents: machineEventResult?.deletedCount || 0,
      productionEvents: productionEventResult?.deletedCount || 0,
    },
  };
};

const getShiftSimClockState = async ({ syncWithDb = true } = {}) => {
  let state = await ensureShiftSimState();
  if (syncWithDb) {
    state = await syncShiftSimStateWithDb(state);
  }
  return state;
};

const getShiftSimNow = async ({ machineId } = {}) => {
  const filter = { source: 'shift-sim' };
  if (machineId) {
    filter.machine = machineId;
  }

  const latest = await MachineTelemetry.findOne(filter)
    .sort({ timestamp: -1 })
    .select({ timestamp: 1 })
    .lean();

  if (latest?.timestamp) {
    return latest.timestamp;
  }

  const state = await getShiftSimClockState({ syncWithDb: true });
  return state.cursorAt || state.shiftStartAt || new Date();
};

module.exports = {
  SHIFT_SIM_KEY,
  ISTANBUL_TIMEZONE,
  getEpochDateFromEnv,
  resolveShiftSchedule,
  getShiftWindowForDate,
  getShiftWindowsForRange,
  ensureShiftSimState,
  prepareShiftSimRun,
  updateShiftSimProgress,
  resetShiftSimClock,
  resetShiftSimData,
  getShiftSimClockState,
  getShiftSimNow,
};
