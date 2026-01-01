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

const DEFECT_RATE_MIN = 0.02;
const DEFECT_RATE_MAX = 0.08;
const DOWNTIME_COUNT_MIN = 1;
const DOWNTIME_COUNT_MAX = 3;
const DOWNTIME_MIN_MS = 5 * 60 * 1000;
const DOWNTIME_MAX_MS = 20 * 60 * 1000;
const DOWNTIME_LONG_MS = 30 * 60 * 1000;
const DOWNTIME_LONG_PROB = 0.2;

const ISTANBUL_TZ = 'Europe/Istanbul';

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

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomBetween = (min, max) => min + Math.random() * (max - min);

const overlaps = (a, b) => a.start < b.end && b.start < a.end;

const sampleTriangular = (min, mode, max) => {
  if (max <= min) return min;
  const safeMode = Math.min(Math.max(mode, min), max);
  const u = Math.random();
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
    if (Math.random() < defectRate) defective += 1;
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

const buildUnplannedBlocks = (shiftStartAt, shiftEndAt, plannedBreak) => {
  const blocks = [];
  const total = randomInt(DOWNTIME_COUNT_MIN, DOWNTIME_COUNT_MAX);
  const durationCandidates = () =>
    Math.random() < DOWNTIME_LONG_PROB
      ? DOWNTIME_LONG_MS
      : randomBetween(DOWNTIME_MIN_MS, DOWNTIME_MAX_MS);

  for (let i = 0; i < total; i += 1) {
    let placed = false;
    for (let attempt = 0; attempt < 50 && !placed; attempt += 1) {
      const duration = durationCandidates();
      const maxStart =
        shiftEndAt.getTime() - shiftStartAt.getTime() - duration;
      if (maxStart <= 0) break;
      const startOffset = Math.random() * maxStart;
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
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `MOCK-${datePart}-${suffix}`;
};

const buildRunId = (ymd) => {
  const datePart = String(ymd).replace(/-/g, '');
  const suffix = Math.random().toString(16).slice(2, 8);
  return `MB-${datePart}-${suffix}`;
};

const resolveArgs = () => {
  const args = process.argv.slice(2);
  const valueOf = (flag) => {
    const idx = args.indexOf(flag);
    if (idx < 0) return null;
    return args[idx + 1] || null;
  };
  const date = valueOf('--date') || valueOf('-d');
  const from = valueOf('--from');
  const to = valueOf('--to');

  if (date && (from || to)) {
    throw new Error('Tek tarih icin sadece --date kullanin.');
  }
  if ((from && !to) || (!from && to)) {
    throw new Error('Tarih araligi icin --from ve --to birlikte zorunlu.');
  }

  if (date) {
    const parsed = parseYmd(date);
    if (!parsed) throw new Error('Gecersiz --date formati. Beklenen: YYYY-MM-DD');
    return { dates: [formatYmd(parsed)], rangeLabel: date };
  }

  if (from && to) {
    const parsedFrom = parseYmd(from);
    const parsedTo = parseYmd(to);
    if (!parsedFrom || !parsedTo) {
      throw new Error('Gecersiz tarih araligi. Beklenen: YYYY-MM-DD');
    }
    const rangeDates = listDates(parsedFrom, parsedTo);
    return { dates: rangeDates, rangeLabel: `${from}..${to}` };
  }

  throw new Error('Kullanim: --date YYYY-MM-DD veya --from YYYY-MM-DD --to YYYY-MM-DD');
};

const main = async () => {
  const { dates, rangeLabel } = resolveArgs();
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

  for (const window of windows) {
    const { date, shiftStartAt, shiftEndAt } = window;
    const runId = buildRunId(date);
    const defectRate = randomBetween(DEFECT_RATE_MIN, DEFECT_RATE_MAX);

    const plannedBreak = await simulationClockService.getShiftWindowForDate(
      new Date(`${date}T12:00:00Z`),
      { shiftStart: PLANNED_BREAK_START, shiftEnd: PLANNED_BREAK_END, includeWeekends: true },
    );
    const plannedBreakWindow = plannedBreak
      ? { start: plannedBreak.shiftStartAt, end: plannedBreak.shiftEndAt }
      : null;

    const unplannedBlocks = buildUnplannedBlocks(
      shiftStartAt,
      shiftEndAt,
      plannedBreakWindow,
    );

    const orderNo = buildOrderNo(date);
    const shiftDurationMs = shiftEndAt.getTime() - shiftStartAt.getTime();
    const idealCycleSeconds = Number(part.idealCycleTime);
    const targetQuantity = Math.max(
      10,
      Math.floor((shiftDurationMs / (idealCycleSeconds * 1000)) * 0.9),
    );

    const jobOrder = await JobOrder.create({
      orderNo,
      part: part._id,
      machine: machine._id,
      targetQuantity,
      status: jobOrderStatuses.IN_PROGRESS,
      startTime: shiftStartAt,
      estimatedDurationMinutes: (idealCycleSeconds * targetQuantity) / 60,
      metadata: {
        simulationSource: SOURCE,
        batchKey,
        simulationRunId: runId,
        shiftDate: date,
      },
    });

    totalJobs += 1;

    const telemetryDocs = [];
    const bucketMap = new Map();
    let carry = 0;
    let onMs = 0;

    for (let t = shiftStartAt.getTime(); t < shiftEndAt.getTime(); t += TELEMETRY_INTERVAL_MS) {
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
        onMs += TELEMETRY_INTERVAL_MS;
        const cycleSeconds = sampleCycleTimeSeconds(idealCycleSeconds);
        const expected = (TELEMETRY_INTERVAL_MS / 1000) / cycleSeconds;
        const quantity = Math.floor(expected + carry);
        carry = expected + carry - quantity;
        if (quantity > 0) {
          const bucketIndex = Math.floor((t - shiftStartAt.getTime()) / BUCKET_MS);
          const bucketStart = new Date(shiftStartAt.getTime() + bucketIndex * BUCKET_MS);
          const bucketKey = bucketStart.toISOString();
          const existing = bucketMap.get(bucketKey) || { start: bucketStart, quantity: 0 };
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
        intervalMs: TELEMETRY_INTERVAL_MS,
        source: SOURCE,
        simulationRunId: runId,
      });
    }

    if (telemetryDocs.length) {
      await MachineTelemetry.insertMany(telemetryDocs);
      totalTelemetry += telemetryDocs.length;
    }

    const buckets = Array.from(bucketMap.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
    let totalQuantity = buckets.reduce((sum, bucket) => sum + bucket.quantity, 0);

    let remaining = targetQuantity;
    let completionTime = null;
    buckets.forEach((bucket) => {
      if (remaining <= 0) {
        bucket.finalQuantity = 0;
        return;
      }
      if (bucket.quantity <= remaining) {
        bucket.finalQuantity = bucket.quantity;
        remaining -= bucket.quantity;
        return;
      }
      bucket.finalQuantity = remaining;
      remaining = 0;
      const fraction = bucket.quantity > 0 ? bucket.finalQuantity / bucket.quantity : 0;
      completionTime = new Date(bucket.start.getTime() + BUCKET_MS * Math.min(fraction, 1));
    });

    if (totalQuantity > targetQuantity) {
      totalQuantity = targetQuantity;
    }

    let totalBucketGood = 0;
    let totalBucketDefect = 0;
    const productionDocs = [];

    productionDocs.push({
      jobOrder: jobOrder._id,
      machine: machine._id,
      eventType: productionEventTypes.START,
      source: 'simulator',
      timestamp: shiftStartAt,
      metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
    });

    buckets.forEach((bucket) => {
      const qty = Number(bucket.finalQuantity || 0);
      if (qty <= 0) return;
      const defective = sampleDefectiveCount(qty, defectRate);
      const good = qty - defective;
      const eventTime = new Date(Math.min(bucket.start.getTime() + BUCKET_MS - 1000, shiftEndAt.getTime() - 1000));

      if (good > 0) {
        productionDocs.push({
          jobOrder: jobOrder._id,
          machine: machine._id,
          eventType: productionEventTypes.PRODUCE,
          quantity: good,
          qualityStatus: 'good',
          source: 'simulator',
          timestamp: eventTime,
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
          timestamp: eventTime,
          metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
        });
        totalBucketDefect += defective;
      }
    });

    const isComplete = totalQuantity >= targetQuantity && targetQuantity > 0;
    if (isComplete) {
      const endAt = completionTime || shiftEndAt;
      productionDocs.push({
        jobOrder: jobOrder._id,
        machine: machine._id,
        eventType: productionEventTypes.COMPLETE,
        source: 'simulator',
        timestamp: endAt,
        metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
      });
    } else {
      productionDocs.push({
        jobOrder: jobOrder._id,
        machine: machine._id,
        eventType: productionEventTypes.AUTO_PAUSE,
        source: 'simulator',
        timestamp: shiftEndAt,
        metadata: { simulationSource: SOURCE, simulationRunId: runId, batchKey },
      });
    }

    if (productionDocs.length) {
      await ProductionEvent.insertMany(productionDocs);
    }

    const producedQuantity = Math.max(0, Math.min(totalQuantity, targetQuantity));
    totalGood += totalBucketGood;
    totalDefect += totalBucketDefect;

    const update = {
      producedQuantity,
      goodQuantity: totalBucketGood,
      defectiveQuantity: totalBucketDefect,
      status: isComplete ? jobOrderStatuses.COMPLETED : jobOrderStatuses.PAUSED,
    };
    if (isComplete) {
      update.endTime = completionTime || shiftEndAt;
      if (completionTime) {
        update.actualDurationMinutes = Math.round(
          (completionTime.getTime() - shiftStartAt.getTime()) / 60000,
        );
      }
    } else {
      update.lastPauseTime = shiftEndAt;
    }

    await JobOrder.updateOne({ _id: jobOrder._id }, { $set: update });

    console.log(
      `[mock-batch] ${date} job=${orderNo} produced=${producedQuantity}/${targetQuantity} defect=${totalBucketDefect} telemetry=${telemetryDocs.length}`,
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
