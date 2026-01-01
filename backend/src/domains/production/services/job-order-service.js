const mongoose = require('mongoose');
const JobOrder = require('../models/job-order-model');
const ProductionEvent = require('../models/production-event-model');
const Part = require('../../parts/models/part-model');
const Machine = require('../../machines/models/machine-model');
const User = require('../../auth/models/user-model');
const { createEvent: createMachineEvent } = require('../../machines/services/machine-event-service');
const jobOrderStatuses = require('../../../constants/job-order-statuses');
const productionEventTypes = require('../../../constants/production-event-types');
const defectTypes = require('../../../constants/defect-types');
const machineStatuses = require('../../../constants/machine-statuses');
const AppError = require('../../../utils/app-error');
const simulationClockService = require('../../simulations/services/simulation-clock-service');

const JOB_STATUS = jobOrderStatuses;
const DEFAULT_TIME_SOURCE = String(
  process.env.JOB_TIME_SOURCE || process.env.JOB_SIM_TELEMETRY_SOURCE || 'shift-sim',
)
  .trim()
  .toLowerCase();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getTodayPrefix = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

const isOrderNoDuplicateError = (error) => {
  if (!error || typeof error !== 'object') return false;
  if (error.code !== 11000) return false;
  if (error.keyPattern?.orderNo || error.keyValue?.orderNo) return true;
  const message = String(error.message || '');
  return message.includes('orderNo_1') || message.includes('orderNo');
};

const getMaxDailySequence = async (datePrefix) => {
  const prefix = `JO-${datePrefix}-`;
  const regex = `^${escapeRegExp(prefix)}(\\d+)$`;

  const results = await JobOrder.aggregate([
    { $match: { orderNo: { $regex: regex, $options: 'i' } } },
    {
      $project: {
        seq: {
          $toInt: { $arrayElemAt: [{ $split: ['$orderNo', '-'] }, 2] },
        },
      },
    },
    { $group: { _id: null, maxSeq: { $max: '$seq' } } },
  ]);

  const maxSeq = results?.[0]?.maxSeq;
  return typeof maxSeq === 'number' && Number.isFinite(maxSeq) ? maxSeq : 0;
};

const generateOrderNo = async () => {
  const datePrefix = getTodayPrefix();
  const maxSeq = await getMaxDailySequence(datePrefix);
  const sequence = `${maxSeq + 1}`.padStart(3, '0');
  return `JO-${datePrefix}-${sequence}`;
};

const computeEstimatedDurationMinutes = (part, targetQuantity) => {
  if (!part || !part.idealCycleTime) return undefined;
  const minutes = (part.idealCycleTime * targetQuantity) / 60;
  return Number(minutes.toFixed(2));
};

const parseEventTime = (value) => {
  if (value === undefined || value === null || value === '') {
    return new Date();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError('Geçersiz zaman formatı.', 400);
  }
  return parsed;
};

const normalizeTimeSource = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'data-gen' || raw === 'shift-sim') return raw;
  return DEFAULT_TIME_SOURCE || 'shift-sim';
};

const resolveTimeSource = (jobOrder, timeSource) => {
  if (timeSource) return normalizeTimeSource(timeSource);
  const fromMeta = jobOrder?.metadata?.simulationSource;
  if (fromMeta) return normalizeTimeSource(fromMeta);
  return normalizeTimeSource();
};

const resolveEventTime = async ({ now, timeSource, machineId } = {}) => {
  if (now !== undefined && now !== null) {
    return parseEventTime(now);
  }
  if (timeSource === 'shift-sim') {
    return simulationClockService.getShiftSimNow({ machineId });
  }
  return new Date();
};

const parseTargetQuantity = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric <= 0) {
    throw new AppError('Geçerli hedef miktar girilmelidir.', 400);
  }
  return numeric;
};

const ensureJobOrder = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Geçersiz iş emri id formatı.', 400);
  }
  const jobOrder = await JobOrder.findById(id);
  if (!jobOrder) {
    throw new AppError('İş emri bulunamadı.', 404);
  }
  return jobOrder;
};

const ensureMachine = async (machineId) => {
  if (!mongoose.Types.ObjectId.isValid(machineId)) {
    throw new AppError('Geçersiz makine id formatı.', 400);
  }
  const machine = await Machine.findById(machineId);
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }
  if (!machine.isActive) {
    throw new AppError('Makine pasif durumda, iş atanamaz.', 400);
  }
  return machine;
};

const resolveAssignedOperator = async (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError('Geçersiz kullanıcı id formatı.', 400);
  }
  const user = await User.findById(value).select('_id');
  if (!user) {
    throw new AppError('Kullanıcı bulunamadı.', 404);
  }
  return user._id;
};

const ensurePart = async (partId) => {
  if (!mongoose.Types.ObjectId.isValid(partId)) {
    throw new AppError('Geçersiz parça id formatı.', 400);
  }
  const part = await Part.findById(partId);
  if (!part) {
    throw new AppError('Parça bulunamadı.', 404);
  }
  return part;
};

const logProductionEvent = async (
  jobOrder,
  { eventType, quantity, qualityStatus, defectType, operator, source, notes, metadata, timestamp },
) => {
  return ProductionEvent.create({
    jobOrder: jobOrder._id,
    machine: jobOrder.machine,
    eventType,
    quantity,
    qualityStatus,
    defectType,
    operator,
    source: source || 'operator',
    notes,
    metadata,
    ...(timestamp && { timestamp }),
  });
};

const listJobOrders = async (filters = {}) => {
  const query = {};
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.machine) {
    query.machine = filters.machine;
  }
  if (filters.part) {
    query.part = filters.part;
  }
  if (filters.search) {
    query.$or = [
      { orderNo: { $regex: filters.search, $options: 'i' } },
      { notes: { $regex: filters.search, $options: 'i' } },
    ];
  }
  return JobOrder.find(query)
    .populate('part', 'code name idealCycleTime')
    .populate('machine', 'code name status currentJobOrder')
    .populate('assignedOperator', 'username firstName lastName')
    .sort({ createdAt: -1 });
};

const getJobOrderById = async (id) => {
  const jobOrder = await JobOrder.findById(id)
    .populate('part', 'code name idealCycleTime')
    .populate('machine', 'code name status currentJobOrder')
    .populate('assignedOperator', 'username firstName lastName');
  if (!jobOrder) {
    throw new AppError('İş emri bulunamadı.', 404);
  }
  return jobOrder;
};

const createJobOrder = async (payload) => {
  const part = await ensurePart(payload.part);
  const machine = await ensureMachine(payload.machine);
  const userProvidedOrderNo = payload.orderNo?.trim() || null;
  const targetQuantity = parseTargetQuantity(payload.targetQuantity);
  const resolvedAssignedOperator = await resolveAssignedOperator(payload.assignedOperator);

  const baseDoc = {
    part: part._id,
    machine: machine._id,
    targetQuantity,
    assignedOperator: resolvedAssignedOperator,
    createdBy: payload.createdBy,
    notes: payload.notes?.trim(),
    estimatedDurationMinutes: computeEstimatedDurationMinutes(part, targetQuantity),
    status: JOB_STATUS.PENDING,
  };

  const maxAttempts = userProvidedOrderNo ? 1 : 5;
  let attempt = 0;
  let lastDuplicate;

  while (attempt < maxAttempts) {
    attempt += 1;
    const orderNo = userProvidedOrderNo || (await generateOrderNo());

    try {
      const jobOrder = await JobOrder.create({
        ...baseDoc,
        orderNo,
      });

      await logProductionEvent(jobOrder, {
        eventType: productionEventTypes.CREATED,
        operator: payload.createdBy,
        source: payload.source || 'operator',
        metadata: {
          targetQuantity: jobOrder.targetQuantity,
        },
      });

      return jobOrder;
    } catch (error) {
      if (isOrderNoDuplicateError(error)) {
        lastDuplicate = error;
        if (userProvidedOrderNo) {
          throw new AppError('Bu iş emri numarası zaten kullanılıyor.', 409);
        }
        if (attempt < maxAttempts) {
          continue;
        }
      }
      throw error;
    }
  }

  throw new AppError(
    `İş emri numarası üretilemedi (duplicate: ${lastDuplicate?.keyValue?.orderNo || 'orderNo'}). Lütfen tekrar deneyin.`,
    409,
  );
};

const updateJobOrder = async (id, payload) => {
  const jobOrder = await ensureJobOrder(id);
  if (![JOB_STATUS.PENDING, JOB_STATUS.PAUSED].includes(jobOrder.status)) {
    throw new AppError('Sadece bekleyen veya duraklatılan iş emirleri güncellenebilir.', 400);
  }

  let part;
  if (payload.part && payload.part.toString() !== jobOrder.part.toString()) {
    part = await ensurePart(payload.part);
    jobOrder.part = part._id;
  }
  if (payload.machine && payload.machine.toString() !== jobOrder.machine.toString()) {
    const machine = await ensureMachine(payload.machine);
    ensureMachineAvailability(machine, jobOrder);

    if (jobOrder.status === JOB_STATUS.PAUSED) {
      const previousMachine = await Machine.findById(jobOrder.machine);
      if (
        previousMachine?.currentJobOrder &&
        previousMachine.currentJobOrder.equals(jobOrder._id)
      ) {
        previousMachine.currentJobOrder = null;
        await previousMachine.save();
      }
    }

    jobOrder.machine = machine._id;
  }
  if (payload.targetQuantity !== undefined) {
    jobOrder.targetQuantity = parseTargetQuantity(payload.targetQuantity);
  }
  if (payload.assignedOperator !== undefined) {
    const resolvedAssignedOperator = await resolveAssignedOperator(payload.assignedOperator);
    jobOrder.assignedOperator = resolvedAssignedOperator || undefined;
  }
  if (payload.notes !== undefined) {
    jobOrder.notes = payload.notes?.trim();
  }

  const partForDuration = part || (await Part.findById(jobOrder.part));
  jobOrder.estimatedDurationMinutes = computeEstimatedDurationMinutes(
    partForDuration,
    jobOrder.targetQuantity,
  );

  await jobOrder.save();

  await logProductionEvent(jobOrder, {
    eventType: productionEventTypes.UPDATED,
    operator: payload.updatedBy,
    source: payload.source || 'operator',
  });

  return jobOrder;
};

const ensureMachineAvailability = (machine, jobOrder) => {
  if (machine.currentJobOrder && !machine.currentJobOrder.equals(jobOrder._id)) {
    throw new AppError('Makine farklı bir iş emri yürütüyor.', 400);
  }
};

const startJobOrder = async (id, { operatorId, source = 'operator', now, timeSource } = {}) => {
  const jobOrder = await ensureJobOrder(id);
  if (jobOrder.status !== JOB_STATUS.PENDING) {
    throw new AppError('İş emri zaten başlatılmış veya tamamlanmış.', 400);
  }

  const resolvedTimeSource = resolveTimeSource(jobOrder, timeSource);
  const eventTime = await resolveEventTime({
    now,
    timeSource: resolvedTimeSource,
    machineId: jobOrder.machine,
  });
  const machine = await ensureMachine(jobOrder.machine);
  ensureMachineAvailability(machine, jobOrder);

  jobOrder.status = JOB_STATUS.IN_PROGRESS;
  jobOrder.startTime = eventTime;
  jobOrder.lastPauseTime = undefined;
  jobOrder.metadata = {
    ...(jobOrder.metadata || {}),
    simulationSource: resolvedTimeSource,
  };
  await jobOrder.save();

  machine.currentJobOrder = jobOrder._id;
  await machine.save();

  await logProductionEvent(jobOrder, {
    eventType: productionEventTypes.START,
    operator: operatorId,
    source,
    metadata: { simulationSource: resolvedTimeSource },
    timestamp: eventTime,
  });

  await createMachineEvent(machine._id, {
    state: machineStatuses.RUNNING,
    source,
    triggeredBy: operatorId,
    jobOrder: jobOrder._id,
    startedAt: eventTime,
    description: `${jobOrder.orderNo} başlatıldı`,
  });

  return jobOrder;
};

const resumeJobOrder = async (
  id,
  { operatorId, source = 'operator', skipMachineEvent = false, now, timeSource } = {},
) => {
  const jobOrder = await ensureJobOrder(id);
  if (jobOrder.status !== JOB_STATUS.PAUSED) {
    throw new AppError('Sadece duraklatılan iş emirleri devam ettirilebilir.', 400);
  }
  const resolvedTimeSource = resolveTimeSource(jobOrder, timeSource);
  const eventTime = await resolveEventTime({
    now,
    timeSource: resolvedTimeSource,
    machineId: jobOrder.machine,
  });
  const machine = await ensureMachine(jobOrder.machine);
  ensureMachineAvailability(machine, jobOrder);

  jobOrder.status = JOB_STATUS.IN_PROGRESS;
  jobOrder.lastPauseTime = undefined;
  jobOrder.metadata = {
    ...(jobOrder.metadata || {}),
    simulationSource: resolvedTimeSource,
  };
  await jobOrder.save();

  machine.currentJobOrder = jobOrder._id;
  await machine.save();

  await logProductionEvent(jobOrder, {
    eventType: productionEventTypes.RESUME,
    operator: operatorId,
    source,
    metadata: { simulationSource: resolvedTimeSource },
    timestamp: eventTime,
  });

  if (!skipMachineEvent) {
    await createMachineEvent(machine._id, {
      state: machineStatuses.RUNNING,
      source,
      triggeredBy: operatorId,
      jobOrder: jobOrder._id,
      startedAt: eventTime,
      description: `${jobOrder.orderNo} devam ettirildi`,
    });
  }

  return jobOrder;
};

const pauseJobOrder = async (
  id,
  { operatorId, source = 'operator', reason, skipMachineEvent = false, now, timeSource } = {},
) => {
  const jobOrder = await ensureJobOrder(id);
  if (jobOrder.status !== JOB_STATUS.IN_PROGRESS) {
    throw new AppError('Sadece aktif iş emirleri duraklatılabilir.', 400);
  }
  const machine = await ensureMachine(jobOrder.machine);
  const resolvedTimeSource = resolveTimeSource(jobOrder, timeSource);
  const eventTime = await resolveEventTime({
    now,
    timeSource: resolvedTimeSource,
    machineId: jobOrder.machine,
  });

  jobOrder.status = JOB_STATUS.PAUSED;
  jobOrder.lastPauseTime = eventTime;
  jobOrder.metadata = {
    ...(jobOrder.metadata || {}),
    simulationSource: resolvedTimeSource,
  };
  await jobOrder.save();

  await logProductionEvent(jobOrder, {
    eventType: source === 'system' ? productionEventTypes.AUTO_PAUSE : productionEventTypes.PAUSE,
    operator: operatorId,
    source,
    notes: reason,
    metadata: { simulationSource: resolvedTimeSource },
    timestamp: eventTime,
  });

  if (!skipMachineEvent) {
    await createMachineEvent(machine._id, {
      state: machineStatuses.DOWNTIME,
      source,
      triggeredBy: operatorId,
      jobOrder: jobOrder._id,
      startedAt: eventTime,
      description: `${jobOrder.orderNo} duraklatıldı`,
      metadata: {
        jobOrder: jobOrder.orderNo,
        reason,
      },
    });
  }

  return jobOrder;
};

const finalizeJobOrder = async (jobOrder, { operatorId, source, eventType, now, timeSource } = {}) => {
  const resolvedTimeSource = resolveTimeSource(jobOrder, timeSource);
  const eventTime = await resolveEventTime({
    now,
    timeSource: resolvedTimeSource,
    machineId: jobOrder.machine,
  });
  jobOrder.status = JOB_STATUS.COMPLETED;
  jobOrder.endTime = eventTime;
  jobOrder.metadata = {
    ...(jobOrder.metadata || {}),
    simulationSource: resolvedTimeSource,
  };
  if (jobOrder.startTime) {
    const duration = (eventTime.getTime() - jobOrder.startTime.getTime()) / 60000;
    jobOrder.actualDurationMinutes = Number(duration.toFixed(2));
  }
  await jobOrder.save();

  const machine = await ensureMachine(jobOrder.machine);
  if (machine.currentJobOrder && machine.currentJobOrder.equals(jobOrder._id)) {
    machine.currentJobOrder = null;
    await machine.save();
  }

  await logProductionEvent(jobOrder, {
    eventType,
    operator: operatorId,
    source,
    metadata: { simulationSource: resolvedTimeSource },
    timestamp: eventTime,
  });

  await createMachineEvent(machine._id, {
    state: machineStatuses.IDLE,
    source,
    triggeredBy: operatorId,
    jobOrder: jobOrder._id,
    startedAt: eventTime,
    description: `${jobOrder.orderNo} tamamlandı`,
  });

  return jobOrder;
};

const completeJobOrder = async (id, { operatorId, source = 'operator', now, timeSource } = {}) => {
  const jobOrder = await ensureJobOrder(id);
  if (![JOB_STATUS.IN_PROGRESS, JOB_STATUS.PAUSED].includes(jobOrder.status)) {
    throw new AppError('Sadece aktif veya duraklatılmış iş emirleri tamamlanabilir.', 400);
  }

  return finalizeJobOrder(jobOrder, {
    operatorId,
    source,
    eventType: productionEventTypes.COMPLETE,
    now,
    timeSource,
  });
};

const cancelJobOrder = async (id, { operatorId, source = 'operator', reason, now, timeSource } = {}) => {
  const jobOrder = await ensureJobOrder(id);
  if (![JOB_STATUS.PENDING, JOB_STATUS.PAUSED].includes(jobOrder.status)) {
    throw new AppError('Sadece bekleyen veya duraklatılmış iş emirleri iptal edilebilir.', 400);
  }

  jobOrder.status = JOB_STATUS.CANCELLED;
  const resolvedTimeSource = resolveTimeSource(jobOrder, timeSource);
  const eventTime = await resolveEventTime({
    now,
    timeSource: resolvedTimeSource,
    machineId: jobOrder.machine,
  });
  jobOrder.endTime = eventTime;
  jobOrder.metadata = {
    ...(jobOrder.metadata || {}),
    simulationSource: resolvedTimeSource,
  };
  await jobOrder.save();

  const machine = await ensureMachine(jobOrder.machine);
  if (machine.currentJobOrder && machine.currentJobOrder.equals(jobOrder._id)) {
    machine.currentJobOrder = null;
    await machine.save();
  }

  await logProductionEvent(jobOrder, {
    eventType: productionEventTypes.CANCEL,
    operator: operatorId,
    source,
    notes: reason,
    metadata: { simulationSource: resolvedTimeSource },
    timestamp: eventTime,
  });

  await createMachineEvent(machine._id, {
    state: machineStatuses.IDLE,
    source,
    triggeredBy: operatorId,
    jobOrder: jobOrder._id,
    startedAt: eventTime,
    description: `${jobOrder.orderNo} iptal edildi`,
    metadata: { reason },
  });

  return jobOrder;
};

const recordProduction = async (
  id,
  { operatorId, quantity, qualityStatus = 'good', defectType, source = 'operator', timestamp, metadata },
) => {
  const jobOrder = await ensureJobOrder(id);
  if (jobOrder.status !== JOB_STATUS.IN_PROGRESS) {
    throw new AppError('Sadece aktif iş emirleri için üretim kaydı yapılabilir.', 400);
  }
  const numericQuantity = Number(quantity);
  if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
    throw new AppError('Geçerli bir miktar girilmelidir.', 400);
  }

  if (!['good', 'defective'].includes(qualityStatus)) {
    throw new AppError('Kalite durumu good veya defective olmalıdır.', 400);
  }
  if (qualityStatus === 'defective' && defectType && !Object.values(defectTypes).includes(defectType)) {
    throw new AppError('Geçersiz hata tipi seçildi.', 400);
  }

  jobOrder.producedQuantity += numericQuantity;
  if (qualityStatus === 'good') {
    jobOrder.goodQuantity += numericQuantity;
  } else {
    jobOrder.defectiveQuantity += numericQuantity;
  }
  await jobOrder.save();

  await logProductionEvent(jobOrder, {
    eventType: qualityStatus === 'good' ? productionEventTypes.PRODUCE : productionEventTypes.DEFECT,
    quantity: numericQuantity,
    qualityStatus,
    defectType,
    operator: operatorId,
    source,
    metadata,
    ...(timestamp && { timestamp: parseEventTime(timestamp) }),
  });

  if (jobOrder.producedQuantity >= jobOrder.targetQuantity && jobOrder.status === JOB_STATUS.IN_PROGRESS) {
    return completeJobOrder(jobOrder.id, { operatorId, source, now: timestamp });
  }

  return jobOrder;
};

const deleteJobOrder = async (id) => {
  const jobOrder = await ensureJobOrder(id);
  if (![JOB_STATUS.PENDING, JOB_STATUS.CANCELLED, JOB_STATUS.COMPLETED].includes(jobOrder.status)) {
    throw new AppError('Sadece bekleyen, iptal edilmiş veya tamamlanmış iş emirleri silinebilir.', 400);
  }
  const machine = await Machine.findById(jobOrder.machine);
  if (machine?.currentJobOrder && machine.currentJobOrder.equals(jobOrder._id)) {
    machine.currentJobOrder = null;
    await machine.save();
  }
  await ProductionEvent.deleteMany({ jobOrder: jobOrder._id });
  await jobOrder.deleteOne();
};

const listProductionEvents = async (jobOrderId, { limit = 100 } = {}) => {
  const jobOrder = await ensureJobOrder(jobOrderId);
  const cappedLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);
  const events = await ProductionEvent.find({ jobOrder: jobOrder._id })
    .sort({ timestamp: -1 })
    .limit(cappedLimit);
  return events;
};

module.exports = {
  listJobOrders,
  getJobOrderById,
  createJobOrder,
  updateJobOrder,
  startJobOrder,
  pauseJobOrder,
  resumeJobOrder,
  completeJobOrder,
  cancelJobOrder,
  recordProduction,
  deleteJobOrder,
  listProductionEvents,
};
