const MachineEvent = require('../../machines/models/machine-event-model');
const machineStatuses = require('../../../constants/machine-statuses');
const simulationClockService = require('../../simulations/services/simulation-clock-service');
const oeeRulesService = require('../../oee/services/oee-rules-service');

const TELEMETRY_SOURCES = {
  SHIFT_SIM: 'shift-sim',
  DATA_GEN: 'data-gen',
  MOCK_BATCH: 'mock-batch',
};

const LEGACY_DATA_GEN_SOURCES = ['data-gen', 'simulator'];

const buildDowntimeSourceFilter = (source) => {
  if (source === TELEMETRY_SOURCES.SHIFT_SIM) {
    return { 'metadata.simulationSource': TELEMETRY_SOURCES.SHIFT_SIM };
  }
  if (source === TELEMETRY_SOURCES.MOCK_BATCH) {
    return { 'metadata.simulationSource': TELEMETRY_SOURCES.MOCK_BATCH };
  }
  if (source === TELEMETRY_SOURCES.DATA_GEN) {
    return {
      $or: [
        { 'metadata.simulationSource': { $exists: false } },
        { 'metadata.simulationSource': TELEMETRY_SOURCES.DATA_GEN },
        { 'metadata.simulationSource': 'simulator' },
      ],
    };
  }
  return {};
};

const buildOverlapQuery = (windowStart, windowEnd) => ({
  startedAt: { $lt: windowEnd },
  $or: [{ endedAt: { $exists: false } }, { endedAt: { $gt: windowStart } }],
});

const resolveShiftWindows = async ({ mode, shiftDateYmd, windowStart, windowEnd }) => {
  if (mode === 'range') {
    const windows = await simulationClockService.getShiftWindowsForRange(windowStart, windowEnd, {
      includeWeekends: false,
    });
    return windows.map((window) => ({ start: window.shiftStartAt, end: window.shiftEndAt }));
  }
  const date = shiftDateYmd ? new Date(`${shiftDateYmd}T00:00:00Z`) : windowStart;
  const window = await simulationClockService.getShiftWindowForDate(date, {
    includeWeekends: false,
  });
  if (!window) return [];
  return [{ start: window.shiftStartAt, end: window.shiftEndAt }];
};

const computeOverlapMs = (intervalStart, intervalEnd, window) => {
  const start = Math.max(intervalStart.getTime(), window.start.getTime());
  const end = Math.min(intervalEnd.getTime(), window.end.getTime());
  return end > start ? end - start : 0;
};

const buildReasonMap = () => {
  const catalog = oeeRulesService.getReasonCatalog();
  return new Map(catalog.map((item) => [item.code, item]));
};

const buildLossBreakdown = async ({ machineId, source, mode, shiftDateYmd, windowStart, windowEnd }) => {
  const shiftWindows = await resolveShiftWindows({ mode, shiftDateYmd, windowStart, windowEnd });
  if (!shiftWindows.length) {
    return { topReasons: [], categoryTotals: { plannedMs: 0, unplannedMs: 0 } };
  }

  const events = await MachineEvent.find({
    machine: machineId,
    state: machineStatuses.DOWNTIME,
    ...buildOverlapQuery(windowStart, windowEnd),
    ...buildDowntimeSourceFilter(source),
  }).lean();

  const reasonMap = buildReasonMap();
  const totalsByReason = new Map();
  const categoryTotals = { plannedMs: 0, unplannedMs: 0 };

  events.forEach((event) => {
    const startedAt = event.startedAt ? new Date(event.startedAt) : windowStart;
    const endedAt = event.endedAt ? new Date(event.endedAt) : windowEnd;
    if (endedAt.getTime() <= startedAt.getTime()) return;

    const reason = event.reasonCode ? reasonMap.get(event.reasonCode) : null;
    const category = event.reasonCategory || reason?.category || 'unplanned';
    const affectsOee = reason?.affectsOee !== undefined ? reason.affectsOee : true;

    if (category === 'planned' && affectsOee === false) {
      return;
    }

    let durationMs = 0;
    shiftWindows.forEach((window) => {
      durationMs += computeOverlapMs(startedAt, endedAt, window);
    });

    if (!durationMs) return;

    const code = event.reasonCode || 'unknown';
    const label = reason?.label || reason?.name || 'Bilinmeyen';

    if (!totalsByReason.has(code)) {
      totalsByReason.set(code, {
        code,
        label,
        category,
        affectsOee,
        durationMs: 0,
        count: 0,
      });
    }

    const entry = totalsByReason.get(code);
    entry.durationMs += durationMs;
    entry.count += 1;

    if (category === 'planned') {
      categoryTotals.plannedMs += durationMs;
    } else {
      categoryTotals.unplannedMs += durationMs;
    }
  });

  const sorted = Array.from(totalsByReason.values()).sort((a, b) => b.durationMs - a.durationMs);
  const topReasons = sorted.slice(0, 3);

  return { topReasons, categoryTotals };
};

module.exports = {
  buildLossBreakdown,
};
