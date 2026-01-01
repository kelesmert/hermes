/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { connectDatabase } = require('../src/config/database');
require('../src/models');

const Machine = require('../src/domains/machines/models/machine-model');
const Part = require('../src/domains/parts/models/part-model');
const JobOrder = require('../src/domains/production/models/job-order-model');
const ProductionEvent = require('../src/domains/production/models/production-event-model');
const MachineTelemetry = require('../src/domains/machines/models/machine-telemetry-model');
const jobOrderStatuses = require('../src/constants/job-order-statuses');
const productionEventTypes = require('../src/constants/production-event-types');
const simulationClockService = require('../src/domains/simulations/services/simulation-clock-service');

const SOURCE = 'mock-batch';
const MACHINE_CODE = 'MCH-001';
const PART_CODE = 'PART-MB-001';
const TELEMETRY_INTERVAL_MS = 60 * 1000;
const PLANNED_BREAK_START = '12:00';
const PLANNED_BREAK_END = '13:00';
const BUCKET_MS = 60 * 60 * 1000;

const MIN_JOB_DURATION_MS = 4 * 60 * 60 * 1000;
const MAX_JOB_DAYS = 5;

const DEFECT_RATE_MIN = 0.02;
const DEFECT_RATE_MAX = 0.08;

const ISTANBUL_TZ = 'Europe/Istanbul';

let rand = Math.random;

const parseYmd = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
};

const formatYmd = (ymd) =>
  `${String(ymd.year).padStart(4, '0')}-${String(ymd.month).padStart(2, '0')}-${String(ymd.day).padStart(2, '0')}`;

const ymdToDate = (ymd) => new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day, 12, 0, 0));

const toYmd = (date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: ISTANBUL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const getWeekdayCode = (ymdString) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: ISTANBUL_TZ,
    weekday: 'short',
  }).format(new Date(`${ymdString}T12:00:00Z`));

const WEEKDAY_LABEL_TR = {
  Mon: 'Pazartesi',
  Tue: 'Sali',
  Wed: 'Carsamba',
  Thu: 'Persembe',
  Fri: 'Cuma',
  Sat: 'Cumartesi',
  Sun: 'Pazar',
};

const isWeekendYmd = (ymdString) => {
  const code = getWeekdayCode(ymdString);
  return code === 'Sat' || code === 'Sun';
};

const addDays = (ymd, days) => {
  const base = ymdToDate(ymd);
  base.setUTCDate(base.getUTCDate() + days);
  return { year: base.getUTCFullYear(), month: base.getUTCMonth() + 1, day: base.getUTCDate() };
};

const listDates = (fromYmd, toYmd) => {
  const dates = [];
  let cursor = { ...fromYmd };
  const end = ymdToDate(toYmd).getTime();
  while (ymdToDate(cursor).getTime() <= end) {
    dates.push(formatYmd(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
};

const listWeekdays = (startYmd, count) => {
  const dates = [];
  let cursor = { ...startYmd };
  while (dates.length < count) {
    const ymd = formatYmd(cursor);
    if (!isWeekendYmd(ymd)) {
      dates.push(ymd);
    }
    cursor = addDays(cursor, 1);
  }
  return dates;
};

const xmur3 = (str) => {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
};

const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const createSeededRandom = (seedLabel) => {
  const seed = xmur3(seedLabel)();
  return mulberry32(seed);
};

const randomInt = (min, max) =>
  Math.floor(rand() * (max - min + 1)) + min;

const randomBetween = (min, max) => min + rand() * (max - min);

const overlaps = (a, b) => a.start < b.end && b.start < a.end;

const sampleTriangular = (min, mode, max) => {
  if (max <= min) return min;
  const safeMode = Math.min(Math.max(mode, min), max);
  const u = rand();
  const c = (safeMode - min) / (max - min);
  if (u < c) {
    return min + Math.sqrt(u * (max - min) * (safeMode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - safeMode));
};

const sampleCycleTimeSeconds = (ideal) => {
  const min = ideal * 0.8;
  const max = ideal * 1.4;
  return sampleTriangular(min, ideal, max);
};

const sampleDefectiveCount = (totalQuantity, defectRate) => {
  if (defectRate <= 0) return 0;
  if (defectRate >= 1) return totalQuantity;
  let defective = 0;
  for (let i = 0; i < totalQuantity; i += 1) {
    if (rand() < defectRate) defective += 1;
  }
  return defective;
};

const buildMetrics = (signalValue) => {
  if (signalValue === 1) {
    return {
      temperatureC: randomBetween(62, 72),
      torqueNm: randomBetween(110, 130),
      energyKwh: randomBetween(3.0, 3.8),
    };
  }
  return {
    temperatureC: randomBetween(28, 35),
    torqueNm: randomBetween(2, 8),
    energyKwh: randomBetween(0.1, 0.4),
  };
};

const pickWeighted = (weights) => {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let threshold = rand() * total;
  for (const [key, weight] of entries) {
    if (threshold <= weight) return key;
    threshold -= weight;
  }
  return entries[entries.length - 1][0];
};

const DOWNTIME_PROFILES = {
  none: { countMin: 0, countMax: 0, minMs: 0, maxMs: 0, longMs: 0, longProb: 0 },
  low: { countMin: 1, countMax: 1, minMs: 5 * 60 * 1000, maxMs: 10 * 60 * 1000, longMs: 0, longProb: 0 },
  medium: { countMin: 1, countMax: 2, minMs: 5 * 60 * 1000, maxMs: 20 * 60 * 1000, longMs: 30 * 60 * 1000, longProb: 0.15 },
  high: { countMin: 2, countMax: 4, minMs: 10 * 60 * 1000, maxMs: 25 * 60 * 1000, longMs: 30 * 60 * 1000, longProb: 0.25 },
};

const DOWNTIME_WEIGHTS = {
  Mon: { high: 0.4, medium: 0.35, low: 0.2, none: 0.05 },
  Tue: { high: 0.2, medium: 0.4, low: 0.3, none: 0.1 },
  Wed: { high: 0.1, medium: 0.3, low: 0.3, none: 0.3 },
  Thu: { high: 0.2, medium: 0.4, low: 0.3, none: 0.1 },
  Fri: { high: 0.25, medium: 0.4, low: 0.25, none: 0.1 },
};

const pickDowntimeProfile = (ymd) => {
  const weekday = getWeekdayCode(ymd);
  const weights = DOWNTIME_WEIGHTS[weekday] || DOWNTIME_WEIGHTS.Mon;
  const profileKey = pickWeighted(weights);
  return DOWNTIME_PROFILES[profileKey];
};

const buildUnplannedBlocks = (shiftStartAt, shiftEndAt, plannedBreak, profile) => {
  const blocks = [];
  const total = randomInt(profile.countMin, profile.countMax);
  if (total <= 0) return blocks;

  const durationCandidates = () =>
    profile.longMs && rand() < profile.longProb
      ? profile.longMs
      : randomBetween(profile.minMs, profile.maxMs);

  for (let i = 0; i < total; i += 1) {
    let placed = false;
    for (let attempt = 0; attempt < 50 && !placed; attempt += 1) {
      const duration = durationCandidates();
      const maxStart = shiftEndAt.getTime() - shiftStartAt.getTime() - duration;
      if (maxStart <= 0) break;
      const startOffset = rand() * maxStart;
      const start = new Date(shiftStartAt.getTime() + startOffset);
      const end = new Date(start.getTime() + duration);
      const candidate = { start, end };
      if (plannedBreak && overlaps(candidate, plannedBreak)) continue;
      if (blocks.some((block) => overlaps(block, candidate))) continue;
      blocks.push(candidate);
      placed = true;
    }
  }

  return blocks.sort((a, b) => a.start.getTime() - b.start.getTime());
};

const buildOrderNo = (ymd) => {
  const datePart = String(ymd).replace(/-/g, '');
  const suffix = Math.floor(rand() * 0xffff)
    .toString(16)
    .padStart(4, '0')
    .toUpperCase();
  return `MOCK-${datePart}-${suffix}`;
};

const buildRunId = (ymd) => {
  const datePart = String(ymd).replace(/-/g, '');
  const suffix = Math.floor(rand() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return `MB-${datePart}-${suffix}`;
};

const resolveArgs = () => {
  const args = process.argv.slice(2);
  const valueOf = (flag) => {
    const idx = args.indexOf(flag);
    if (idx < 0) return null;
    return args[idx + 1] || null;
  };
  const hasFlag = (flag) => args.includes(flag);

  const date = valueOf('--date') || valueOf('-d');
  const from = valueOf('--from');
  const to = valueOf('--to');
  const week = hasFlag('--week');
  const randomize = hasFlag('--random');

  if (week && !date) {
    throw new Error('--week kullanimi icin --date zorunlu.');
  }
  if (week && (from || to)) {
    throw new Error('--week ile --from/--to birlikte kullanilamaz.');
  }
  if (date && (from || to)) {
    throw new Error('Tek tarih icin sadece --date kullanin.');
  }
  if ((from && !to) || (!from && to)) {
    throw new Error('Tarih araligi icin --from ve --to birlikte zorunlu.');
  }

  if (date) {
    const parsed = parseYmd(date);
    if (!parsed) throw new Error('Gecersiz --date formati. Beklenen: YYYY-MM-DD');
    const normalized = formatYmd(parsed);
    if (isWeekendYmd(normalized)) {
      const dayName = WEEKDAY_LABEL_TR[getWeekdayCode(normalized)] || 'hafta sonu';
      throw new Error(`Secilen tarih hafta sonu: ${normalized} (${dayName}).`);
    }
    if (week) {
      return {
        dates: listWeekdays(parsed, 5),
        rangeLabel: `${normalized}-week`,
        randomize,
      };
    }
    return { dates: [normalized], rangeLabel: normalized, randomize };
  }

  if (from && to) {
    const parsedFrom = parseYmd(from);
    const parsedTo = parseYmd(to);
    if (!parsedFrom || !parsedTo) {
      throw new Error('Gecersiz tarih araligi. Beklenen: YYYY-MM-DD');
    }
    return {
      dates: listDates(parsedFrom, parsedTo),
      rangeLabel: `${from}..${to}`,
      randomize,
    };
  }

  throw new Error('Kullanim: --date YYYY-MM-DD [--week] [--random] veya --from YYYY-MM-DD --to YYYY-MM-DD');
};

const findWindowIndexForTime = (windows, time) =>
  windows.findIndex(
    (window) => time >= window.shiftStartAt.getTime() && time < window.shiftEndAt.getTime(),
  );

const findNextWindowIndex = (windows, time) =>
  windows.findIndex((window) => window.shiftEndAt.getTime() > time);

const computeRemainingShiftMs = (fromTime, windows) => {
  let remaining = 0;
  for (const window of windows) {
    if (window.shiftEndAt.getTime() <= fromTime) continue;
    const start = Math.max(fromTime, window.shiftStartAt.getTime());
    if (start >= window.shiftEndAt.getTime()) continue;
    remaining += window.shiftEndAt.getTime() - start;
  }
  return remaining;
};

const addShiftTime = (startAt, durationMs, windows) => {
  let remaining = durationMs;
  let cursor = startAt.getTime();

  for (const window of windows) {
    if (window.shiftEndAt.getTime() <= cursor) continue;
    const segmentStart = Math.max(cursor, window.shiftStartAt.getTime());
    if (segmentStart >= window.shiftEndAt.getTime()) continue;
    const available = window.shiftEndAt.getTime() - segmentStart;
    if (remaining <= available) {
      return { endAt: new Date(segmentStart + remaining), exhausted: false };
    }
    remaining -= available;
    cursor = window.shiftEndAt.getTime();
  }

  return { endAt: windows[windows.length - 1].shiftEndAt, exhausted: true };
};

const sampleJobDurationMs = (shiftDurationMs) => {
  const dayMs = shiftDurationMs;
  const maxMs = dayMs * MAX_JOB_DAYS;
  const pick = rand();
  if (pick < 0.22) {
    return randomBetween(MIN_JOB_DURATION_MS, dayMs);
  }
  if (pick < 0.57) {
    return randomBetween(dayMs, dayMs * 2);
  }
  if (pick < 0.82) {
    return randomBetween(dayMs * 2, dayMs * 3);
  }
  if (pick < 0.93) {
    return randomBetween(dayMs * 3, dayMs * 4);
  }
  return randomBetween(dayMs * 4, maxMs);
};

const buildJobPlans = (windows) => {
  const plans = [];
  let cursor = windows[0].shiftStartAt.getTime();

  while (cursor < windows[windows.length - 1].shiftEndAt.getTime()) {
    const activeIndex = findWindowIndexForTime(windows, cursor);
    let startTime = cursor;
    let windowIndex = activeIndex;

    if (activeIndex < 0) {
      const nextIndex = findNextWindowIndex(windows, cursor);
      if (nextIndex < 0) break;
      startTime = windows[nextIndex].shiftStartAt.getTime();
      windowIndex = nextIndex;
    }

    const remainingShiftMs = computeRemainingShiftMs(startTime, windows);
    if (remainingShiftMs < MIN_JOB_DURATION_MS) break;

    const shiftDurationMs =
      windows[windowIndex].shiftEndAt.getTime() - windows[windowIndex].shiftStartAt.getTime();
    let durationMs = sampleJobDurationMs(shiftDurationMs);
    if (durationMs > remainingShiftMs) {
      durationMs = remainingShiftMs;
    }
    if (durationMs < MIN_JOB_DURATION_MS) break;

    const { endAt } = addShiftTime(new Date(startTime), durationMs, windows);
    if (!endAt || endAt.getTime() <= startTime) break;

    plans.push({
      startAt: new Date(startTime),
      endAt,
    });

    cursor = endAt.getTime();
  }

  return plans;
};

const buildJobSegments = (jobPlan, windows) => {
  const segments = [];
  windows.forEach((window) => {
    const start = Math.max(jobPlan.startAt.getTime(), window.shiftStartAt.getTime());
    const end = Math.min(jobPlan.endAt.getTime(), window.shiftEndAt.getTime());
    if (end > start) {
      segments.push({
        date: window.date,
        shiftStartAt: window.shiftStartAt,
        shiftEndAt: window.shiftEndAt,
        startAt: new Date(start),
        endAt: new Date(end),
      });
    }
  });
  return segments;
};

const estimateOperatingMs = (segments, dayData) => {
  let operatingMs = 0;
  segments.forEach((segment) => {
    const info = dayData.get(segment.date);
    if (!info) return;
    let segmentMs = segment.endAt.getTime() - segment.startAt.getTime();
    if (info.plannedBreakWindow) {
      const overlapStart = Math.max(segment.startAt.getTime(), info.plannedBreakWindow.start.getTime());
      const overlapEnd = Math.min(segment.endAt.getTime(), info.plannedBreakWindow.end.getTime());
      if (overlapEnd > overlapStart) {
        segmentMs -= overlapEnd - overlapStart;
      }
    }
    info.unplannedBlocks.forEach((block) => {
      const overlapStart = Math.max(segment.startAt.getTime(), block.start.getTime());
      const overlapEnd = Math.min(segment.endAt.getTime(), block.end.getTime());
      if (overlapEnd > overlapStart) {
        segmentMs -= overlapEnd - overlapStart;
      }
    });
    if (segmentMs > 0) {
      operatingMs += segmentMs;
    }
  });
  return operatingMs;
};

const main = async () => {
  const { dates, rangeLabel, randomize } = resolveArgs();
  rand = randomize ? Math.random : createSeededRandom(`${rangeLabel}-${dates.join(',')}`);

  await connectDatabase();

  const machine = await Machine.findOne({ code: MACHINE_CODE });
  if (!machine) {
    throw new Error(`Makine bulunamadi: ${MACHINE_CODE}`);
  }
  const part = await Part.findOne({ code: PART_CODE });
  if (!part) {
    throw new Error(`Parca bulunamadi: ${PART_CODE}`);
  }
  if (!part.idealCycleTime || part.idealCycleTime <= 0) {
    throw new Error('Parca idealCycleTime gecersiz.');
  }

  const windows = [];
  for (const date of dates) {
    const reference = new Date(`${date}T12:00:00Z`);
    const window = await simulationClockService.getShiftWindowForDate(reference, {
      includeWeekends: false,
    });
    if (!window) {
      console.log(`[mock-batch] ${date} hafta sonu, atlandi.`);
      continue;
    }
    windows.push({
      date,
      shiftStartAt: window.shiftStartAt,
      shiftEndAt: window.shiftEndAt,
    });
  }

  if (!windows.length) {
    console.log('[mock-batch] Uretilecek vardiya bulunamadi.');
    return;
  }

  windows.sort((a, b) => a.shiftStartAt.getTime() - b.shiftStartAt.getTime());

  const rangeStart = new Date(
    Math.min(...windows.map((item) => item.shiftStartAt.getTime())),
  );
  const rangeEnd = new Date(
    Math.max(...windows.map((item) => item.shiftEndAt.getTime())),
  );

  await Promise.all([
    MachineTelemetry.deleteMany({
      machine: machine._id,
      source: SOURCE,
      timestamp: { $gte: rangeStart, $lt: rangeEnd },
    }),
    ProductionEvent.deleteMany({
      machine: machine._id,
      timestamp: { $gte: rangeStart, $lt: rangeEnd },
      'metadata.simulationSource': SOURCE,
    }),
    JobOrder.deleteMany({
      machine: machine._id,
      startTime: { $gte: rangeStart, $lt: rangeEnd },
      'metadata.simulationSource': SOURCE,
    }),
  ]);

  const batchKey = `MBATCH-${rangeLabel}`;
  let totalTelemetry = 0;
  let totalGood = 0;
  let totalDefect = 0;
  let totalJobs = 0;

  const dayData = new Map();
  for (const window of windows) {
    const plannedBreak = await simulationClockService.getShiftWindowForDate(
      new Date(`${window.date}T12:00:00Z`),
      { shiftStart: PLANNED_BREAK_START, shiftEnd: PLANNED_BREAK_END, includeWeekends: true },
    );
    const plannedBreakWindow = plannedBreak
      ? { start: plannedBreak.shiftStartAt, end: plannedBreak.shiftEndAt }
      : null;
    const profile = pickDowntimeProfile(window.date);
    const unplannedBlocks = buildUnplannedBlocks(
      window.shiftStartAt,
      window.shiftEndAt,
      plannedBreakWindow,
      profile,
    );
    const defectRate = randomBetween(DEFECT_RATE_MIN, DEFECT_RATE_MAX);
    dayData.set(window.date, {
      plannedBreakWindow,
      unplannedBlocks,
      defectRate,
    });
  }

  const jobPlans = buildJobPlans(windows);

  for (const jobPlan of jobPlans) {
    const segments = buildJobSegments(jobPlan, windows);
    if (!segments.length) continue;

    const startYmd = toYmd(jobPlan.startAt);
    const runId = buildRunId(startYmd);
    const orderNo = buildOrderNo(startYmd);
    const idealCycleSeconds = Number(part.idealCycleTime);
    const expectedCycleSeconds = idealCycleSeconds * 1.0667;
    const estimatedOperatingMs = estimateOperatingMs(segments, dayData);
    const initialTarget = Math.max(1, Math.floor((estimatedOperatingMs / 1000) / expectedCycleSeconds));

    const jobOrder = await JobOrder.create({
      orderNo,
      part: part._id,
      machine: machine._id,
      targetQuantity: initialTarget,
      status: jobOrderStatuses.IN_PROGRESS,
      startTime: jobPlan.startAt,
      estimatedDurationMinutes: Math.round((initialTarget * idealCycleSeconds) / 60),
      metadata: {
        simulationSource: SOURCE,
        batchKey,
        simulationRunId: runId,
        shiftDate: startYmd,
      },
    });

    totalJobs += 1;

    const telemetryDocs = [];
    const bucketMap = new Map();
    let carry = 0;
    let onMs = 0;
    let plannedDurationMs = 0;

    segments.forEach((segment) => {
      plannedDurationMs += segment.endAt.getTime() - segment.startAt.getTime();
      const info = dayData.get(segment.date);
      const plannedBreakWindow = info?.plannedBreakWindow;
      const unplannedBlocks = info?.unplannedBlocks || [];

      for (let t = segment.startAt.getTime(); t < segment.endAt.getTime(); t += TELEMETRY_INTERVAL_MS) {
        const intervalMs = Math.min(TELEMETRY_INTERVAL_MS, segment.endAt.getTime() - t);
        const timestamp = new Date(t);
        const withinPlanned =
          plannedBreakWindow &&
          timestamp.getTime() >= plannedBreakWindow.start.getTime() &&
          timestamp.getTime() < plannedBreakWindow.end.getTime();
        const withinUnplanned = unplannedBlocks.some(
          (block) => timestamp.getTime() >= block.start.getTime() && timestamp.getTime() < block.end.getTime(),
        );

        const signalValue = withinPlanned || withinUnplanned ? 0 : 1;
        if (signalValue === 1) {
          onMs += intervalMs;
          const cycleSeconds = sampleCycleTimeSeconds(idealCycleSeconds);
          const expected = (intervalMs / 1000) / cycleSeconds;
          const quantity = Math.floor(expected + carry);
          carry = expected + carry - quantity;
          if (quantity > 0) {
            const bucketIndex = Math.floor((t - segment.shiftStartAt.getTime()) / BUCKET_MS);
            const bucketStart = new Date(segment.shiftStartAt.getTime() + bucketIndex * BUCKET_MS);
            const bucketKey = `${segment.date}-${bucketIndex}`;
            const existing = bucketMap.get(bucketKey) || {
              start: bucketStart,
              date: segment.date,
              quantity: 0,
            };
            existing.quantity += quantity;
            bucketMap.set(bucketKey, existing);
          }
        }

        telemetryDocs.push({
          machine: machine._id,
          jobOrder: jobOrder._id,
          timestamp,
          signalValue,
          metrics: buildMetrics(signalValue),
          intervalMs,
          source: SOURCE,
          simulationRunId: runId,
        });
      }
    });

    if (telemetryDocs.length) {
      await MachineTelemetry.insertMany(telemetryDocs);
      totalTelemetry += telemetryDocs.length;
    }

    const buckets = Array.from(bucketMap.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
    let totalQuantity = buckets.reduce((sum, bucket) => sum + bucket.quantity, 0);

    const productionDocs = [];
    productionDocs.push({
      jobOrder: jobOrder._id,
      machine: machine._id,
      eventType: productionEventTypes.START,
      source: 'simulator',
      timestamp: jobPlan.startAt,
      metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
    });

    segments.forEach((segment, index) => {
      if (index > 0) {
        productionDocs.push({
          jobOrder: jobOrder._id,
          machine: machine._id,
          eventType: productionEventTypes.AUTO_RESUME,
          source: 'simulator',
          timestamp: segment.startAt,
          metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
        });
      }
      if (jobPlan.endAt.getTime() > segment.shiftEndAt.getTime()) {
        productionDocs.push({
          jobOrder: jobOrder._id,
          machine: machine._id,
          eventType: productionEventTypes.AUTO_PAUSE,
          source: 'simulator',
          timestamp: segment.shiftEndAt,
          metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
        });
      }
    });

    let totalBucketGood = 0;
    let totalBucketDefect = 0;

    buckets.forEach((bucket) => {
      const qty = Number(bucket.quantity || 0);
      if (qty <= 0) return;
      const defectRate = dayData.get(bucket.date)?.defectRate ?? DEFECT_RATE_MIN;
      const defective = sampleDefectiveCount(qty, defectRate);
      const good = qty - defective;
      const bucketEnd = new Date(Math.min(bucket.start.getTime() + BUCKET_MS - 1000, jobPlan.endAt.getTime() - 1000));

      if (good > 0) {
        productionDocs.push({
          jobOrder: jobOrder._id,
          machine: machine._id,
          eventType: productionEventTypes.PRODUCE,
          quantity: good,
          qualityStatus: 'good',
          source: 'simulator',
          timestamp: bucketEnd,
          metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
        });
        totalBucketGood += good;
      }
      if (defective > 0) {
        productionDocs.push({
          jobOrder: jobOrder._id,
          machine: machine._id,
          eventType: productionEventTypes.DEFECT,
          quantity: defective,
          qualityStatus: 'defective',
          source: 'simulator',
          timestamp: bucketEnd,
          metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
        });
        totalBucketDefect += defective;
      }
    });

    if (totalQuantity <= 0) {
      totalQuantity = 1;
      totalBucketGood = Math.max(totalBucketGood, 1);
      productionDocs.push({
        jobOrder: jobOrder._id,
        machine: machine._id,
        eventType: productionEventTypes.PRODUCE,
        quantity: 1,
        qualityStatus: 'good',
        source: 'simulator',
        timestamp: new Date(Math.min(jobPlan.endAt.getTime() - 1000, jobPlan.startAt.getTime() + 1000)),
        metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
      });
    }

    productionDocs.push({
      jobOrder: jobOrder._id,
      machine: machine._id,
      eventType: productionEventTypes.COMPLETE,
      source: 'simulator',
      timestamp: jobPlan.endAt,
      metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
    });

    if (productionDocs.length) {
      await ProductionEvent.insertMany(productionDocs);
    }

    totalGood += totalBucketGood;
    totalDefect += totalBucketDefect;

    await JobOrder.updateOne(
      { _id: jobOrder._id },
      {
        $set: {
          targetQuantity: Math.max(1, totalQuantity),
          producedQuantity: Math.max(1, totalQuantity),
          goodQuantity: totalBucketGood,
          defectiveQuantity: totalBucketDefect,
          status: jobOrderStatuses.COMPLETED,
          endTime: jobPlan.endAt,
          actualDurationMinutes: Math.round(plannedDurationMs / 60000),
          estimatedDurationMinutes: Math.round((totalQuantity * idealCycleSeconds) / 60),
        },
      },
    );

    const durationHours = Math.round(plannedDurationMs / 360000) / 10;
    console.log(
      `[mock-batch] job=${orderNo} ${toYmd(jobPlan.startAt)}-${toYmd(jobPlan.endAt)} duration=${durationHours}h produced=${totalQuantity} defect=${totalBucketDefect} telemetry=${telemetryDocs.length}`,
    );
  }

  console.log(
    `[mock-batch] tamamlandi. jobs=${totalJobs} telemetry=${totalTelemetry} good=${totalGood} defect=${totalDefect}`,
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[mock-batch] hata:', error.message);
    process.exit(1);
  });
