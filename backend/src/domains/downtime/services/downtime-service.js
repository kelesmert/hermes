const mongoose = require('mongoose');
const MachineEvent = require('../../machines/models/machine-event-model');
const { createEvent: createMachineEvent } = require('../../machines/services/machine-event-service');
const AppError = require('../../../utils/app-error');
const oeeRulesService = require('../../oee/services/oee-rules-service');
const machineStatuses = require('../../../constants/machine-statuses');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getReason = (reasonCode) => {
  const catalog = oeeRulesService.getReasonCatalog();
  const match = catalog.find((item) => item.code === reasonCode);
  if (!match) {
    throw new AppError('Geçersiz reasonCode.', 400);
  }
  if (!['planned', 'unplanned'].includes(match.category)) {
    throw new AppError('ReasonCode kategorisi desteklenmiyor.', 400);
  }
  return match;
};

const parseOptionalDate = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError('Geçersiz tarih formatı.', 400);
  }
  return parsed;
};

const buildOverlapFilter = ({ from, to }) => {
  if (!from && !to) return {};

  const now = new Date();
  const effectiveFrom = from || new Date(0);
  const effectiveTo = to || now;

  return {
    startedAt: { $lt: effectiveTo },
    $or: [{ endedAt: { $exists: false } }, { endedAt: { $gt: effectiveFrom } }],
  };
};

const listDowntimes = async (filters = {}) => {
  const {
    machineId,
    from,
    to,
    status,
    reasonCode,
    category,
    limit = 100,
  } = filters;

  if (machineId && !isValidObjectId(machineId)) {
    throw new AppError('Geçersiz makine id formatı.', 400);
  }

  const fromDate = parseOptionalDate(from);
  const toDate = parseOptionalDate(to);

  const query = {
    state: machineStatuses.DOWNTIME,
    ...buildOverlapFilter({ from: fromDate, to: toDate }),
  };

  if (machineId) {
    query.machine = machineId;
  }

  if (status === 'open') {
    query.endedAt = { $exists: false };
  } else if (status === 'closed') {
    query.endedAt = { $exists: true };
  } else if (status) {
    throw new AppError('Geçersiz status filtresi.', 400);
  }

  if (reasonCode) {
    query.reasonCode = reasonCode;
  }

  if (category) {
    if (!['planned', 'unplanned'].includes(category)) {
      throw new AppError('Geçersiz category filtresi.', 400);
    }
    query.reasonCategory = category;
  }

  const cappedLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);

  return MachineEvent.find(query)
    .sort({ startedAt: -1 })
    .limit(cappedLimit)
    .populate('machine', 'code name status currentJobOrder')
    .populate('jobOrder', 'orderNo status machine');
};

const canEditWithinWindow = (event, windowMinutes) => {
  const base = event.endedAt || event.startedAt;
  const deadline = new Date(base.getTime() + windowMinutes * 60 * 1000);
  return new Date() <= deadline;
};

const updateDowntime = async (id, payload, { userId } = {}) => {
  if (!isValidObjectId(id)) {
    throw new AppError('Geçersiz duruş id formatı.', 400);
  }

  const event = await MachineEvent.findById(id);
  if (!event) {
    throw new AppError('Duruş kaydı bulunamadı.', 404);
  }
  if (event.state !== machineStatuses.DOWNTIME) {
    throw new AppError('Sadece downtime eventleri güncellenebilir.', 400);
  }

  if (!canEditWithinWindow(event, 5)) {
    throw new AppError('Düzeltme penceresi doldu. Reason değişimi için split kullanın.', 409);
  }

  const nextReasonCode = payload?.reasonCode?.trim();
  if (!nextReasonCode) {
    throw new AppError('reasonCode zorunludur.', 400);
  }
  const reason = getReason(nextReasonCode);

  const nextNotes =
    payload?.notes === undefined ? undefined : String(payload?.notes ?? '').trim();

  event.reasonCode = nextReasonCode;
  event.reasonCategory = reason.category;

  const nextMetadata = { ...(event.metadata || {}) };
  if (payload?.notes !== undefined) {
    nextMetadata.notes = nextNotes;
  }
  nextMetadata.reasonUpdatedAt = new Date();
  if (userId) {
    nextMetadata.reasonUpdatedBy = userId;
  }
  event.metadata = nextMetadata;

  await event.save();

  return event.populate('machine', 'code name status currentJobOrder');
};

const splitDowntime = async (id, payload, { userId } = {}) => {
  if (!isValidObjectId(id)) {
    throw new AppError('Geçersiz duruş id formatı.', 400);
  }

  const event = await MachineEvent.findById(id);
  if (!event) {
    throw new AppError('Duruş kaydı bulunamadı.', 404);
  }
  if (event.state !== machineStatuses.DOWNTIME) {
    throw new AppError('Sadece downtime eventleri split edilebilir.', 400);
  }
  if (event.endedAt) {
    throw new AppError('Sadece açık duruşlar split edilebilir.', 409);
  }

  const nextReasonCode = payload?.reasonCode?.trim();
  if (!nextReasonCode) {
    throw new AppError('reasonCode zorunludur.', 400);
  }
  const reason = getReason(nextReasonCode);

  const splitAt = payload?.splitAt ? parseOptionalDate(payload.splitAt) : new Date();
  const now = new Date();
  if (splitAt.getTime() > now.getTime()) {
    throw new AppError('splitAt gelecekte olamaz.', 400);
  }
  if (splitAt.getTime() < event.startedAt.getTime()) {
    throw new AppError('splitAt başlangıçtan önce olamaz.', 400);
  }

  const nextNotes =
    payload?.notes === undefined ? undefined : String(payload?.notes ?? '').trim();

  const nextMetadata = { ...(event.metadata || {}) };
  if (payload?.notes !== undefined) {
    nextMetadata.notes = nextNotes;
  }
  nextMetadata.splitFromEventId = event._id;
  nextMetadata.splitAt = splitAt;

  const newEvent = await createMachineEvent(event.machine, {
    state: machineStatuses.DOWNTIME,
    startedAt: splitAt,
    reasonCode: nextReasonCode,
    reasonCategory: reason.category,
    jobOrder: event.jobOrder || undefined,
    source: 'operator',
    triggeredBy: userId,
    description: 'Reason değişimi split ile yapıldı',
    metadata: nextMetadata,
  });

  return newEvent.populate('machine', 'code name status currentJobOrder');
};

module.exports = {
  listDowntimes,
  updateDowntime,
  splitDowntime,
};
