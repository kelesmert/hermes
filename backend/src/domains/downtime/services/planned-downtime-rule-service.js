const mongoose = require('mongoose');
const PlannedDowntimeRule = require('../models/planned-downtime-rule-model');
const Machine = require('../../machines/models/machine-model');
const AppError = require('../../../utils/app-error');
const oeeRulesService = require('../../oee/services/oee-rules-service');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getReason = (reasonCode) => {
  const catalog = oeeRulesService.getReasonCatalog();
  const match = catalog.find((item) => item.code === reasonCode);
  if (!match) {
    throw new AppError('Geçersiz reasonCode.', 400);
  }
  if (match.category !== 'planned') {
    throw new AppError('Planlı duruş için sadece planned category reasonCode kullanılabilir.', 400);
  }
  return match;
};

const parseTime = (value, fieldName) => {
  const raw = String(value || '').trim();
  if (!/^\d{2}:\d{2}$/.test(raw)) {
    throw new AppError(`${fieldName} HH:mm formatında olmalıdır.`, 400);
  }
  const [hh, mm] = raw.split(':').map((item) => Number(item));
  if (Number.isNaN(hh) || Number.isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    throw new AppError(`${fieldName} geçersiz.`, 400);
  }
  return raw;
};

const parseDate = (value, fieldName) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`${fieldName} geçersiz tarih formatı.`, 400);
  }
  return parsed;
};

const ensureMachinesExist = async (machineIds) => {
  if (!Array.isArray(machineIds) || machineIds.length === 0) {
    throw new AppError('machineIds zorunludur.', 400);
  }
  const invalid = machineIds.find((id) => !isValidObjectId(id));
  if (invalid) {
    throw new AppError('Geçersiz makine id formatı.', 400);
  }

  const machines = await Machine.find({ _id: { $in: machineIds } }).select({ _id: 1, isActive: 1 });
  if (machines.length !== machineIds.length) {
    throw new AppError('Makine bulunamadı.', 404);
  }
  const inactive = machines.find((m) => m.isActive === false);
  if (inactive) {
    throw new AppError('Pasif makineler için planlı duruş oluşturulamaz.', 400);
  }
};

const normalizeTimezone = (value) => {
  if (value === undefined) return 'Europe/Istanbul';
  const tz = String(value || '').trim();
  if (!tz) return 'Europe/Istanbul';
  if (tz !== 'Europe/Istanbul') {
    throw new AppError('İlk fazda sadece Europe/Istanbul timezone desteklenir.', 400);
  }
  return tz;
};

const validateRulePayload = async (payload) => {
  const name = String(payload?.name || '').trim();
  if (!name) {
    throw new AppError('name zorunludur.', 400);
  }

  const type = String(payload?.type || '').trim();
  if (!['recurring_daily', 'one_time'].includes(type)) {
    throw new AppError('type recurring_daily veya one_time olmalıdır.', 400);
  }

  const timezone = normalizeTimezone(payload?.timezone);

  const reasonCode = String(payload?.reasonCode || '').trim();
  if (!reasonCode) {
    throw new AppError('reasonCode zorunludur.', 400);
  }
  getReason(reasonCode);

  const machineIds = payload?.machineIds;
  await ensureMachinesExist(machineIds);

  const priority =
    payload?.priority === undefined || payload?.priority === null
      ? 0
      : Number(payload.priority);
  if (Number.isNaN(priority)) {
    throw new AppError('priority sayısal olmalıdır.', 400);
  }

  const isActive = payload?.isActive === undefined ? true : Boolean(payload.isActive);

  if (type === 'recurring_daily') {
    const startTime = parseTime(payload?.recurrence?.startTime, 'recurrence.startTime');
    const endTime = parseTime(payload?.recurrence?.endTime, 'recurrence.endTime');
    if (endTime <= startTime) {
      throw new AppError('recurrence.endTime startTime’dan sonra olmalıdır.', 400);
    }
    const daysOfWeek = payload?.recurrence?.daysOfWeek;
    if (daysOfWeek !== undefined) {
      if (!Array.isArray(daysOfWeek) || daysOfWeek.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
        throw new AppError('daysOfWeek 0-6 arası sayılardan oluşmalıdır.', 400);
      }
    }

    return {
      name,
      type,
      timezone,
      reasonCode,
      machineIds,
      priority,
      isActive,
      recurrence: {
        startTime,
        endTime,
        ...(daysOfWeek !== undefined && { daysOfWeek }),
      },
      startAt: undefined,
      endAt: undefined,
    };
  }

  const startAt = parseDate(payload?.startAt, 'startAt');
  const endAt = parseDate(payload?.endAt, 'endAt');
  if (endAt.getTime() <= startAt.getTime()) {
    throw new AppError('endAt startAt’dan sonra olmalıdır.', 400);
  }

  return {
    name,
    type,
    timezone,
    reasonCode,
    machineIds,
    priority,
    isActive,
    recurrence: undefined,
    startAt,
    endAt,
  };
};

const listRules = async (filters = {}) => {
  const query = {};
  if (filters.machineId) {
    if (!isValidObjectId(filters.machineId)) {
      throw new AppError('Geçersiz makine id formatı.', 400);
    }
    query.machineIds = filters.machineId;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === 'true';
  }
  return PlannedDowntimeRule.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .populate('machineIds', 'code name isActive');
};

const createRule = async (payload, { userId } = {}) => {
  const validated = await validateRulePayload(payload);

  const created = await PlannedDowntimeRule.create({
    ...validated,
    createdBy: userId,
  });

  return created.populate('machineIds', 'code name isActive');
};

const updateRule = async (id, payload) => {
  if (!isValidObjectId(id)) {
    throw new AppError('Geçersiz kural id formatı.', 400);
  }
  const rule = await PlannedDowntimeRule.findById(id);
  if (!rule) {
    throw new AppError('Kural bulunamadı.', 404);
  }

  const next = { ...rule.toObject(), ...payload };
  const validated = await validateRulePayload(next);

  rule.name = validated.name;
  rule.type = validated.type;
  rule.timezone = validated.timezone;
  rule.reasonCode = validated.reasonCode;
  rule.machineIds = validated.machineIds;
  rule.priority = validated.priority;
  rule.isActive = validated.isActive;
  rule.recurrence = validated.recurrence;
  rule.startAt = validated.startAt;
  rule.endAt = validated.endAt;

  await rule.save();

  return rule.populate('machineIds', 'code name isActive');
};

const deleteRule = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError('Geçersiz kural id formatı.', 400);
  }
  const rule = await PlannedDowntimeRule.findById(id);
  if (!rule) {
    throw new AppError('Kural bulunamadı.', 404);
  }
  await PlannedDowntimeRule.deleteOne({ _id: rule._id });
};

module.exports = {
  listRules,
  createRule,
  updateRule,
  deleteRule,
};

