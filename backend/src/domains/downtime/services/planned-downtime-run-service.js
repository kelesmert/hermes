const mongoose = require('mongoose');
const PlannedDowntimeRun = require('../models/planned-downtime-run-model');
const AppError = require('../../../utils/app-error');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const RUN_STATUSES = [
  'scheduled',
  'started',
  'ended',
  'skipped_no_active_job',
  'skipped_conflict',
];

const parseOptionalDate = (value, fieldName) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`${fieldName} geçersiz tarih formatı.`, 400);
  }
  return parsed;
};

const buildOverlapFilter = ({ from, to }) => {
  if (!from && !to) return {};

  const now = new Date();
  const effectiveFrom = from || new Date(0);
  const effectiveTo = to || now;

  return {
    scheduledStartAt: { $lt: effectiveTo },
    scheduledEndAt: { $gt: effectiveFrom },
  };
};

const listRuns = async (filters = {}) => {
  const { machineId, from, to, status, limit = 200 } = filters;

  if (machineId && !isValidObjectId(machineId)) {
    throw new AppError('Geçersiz makine id formatı.', 400);
  }

  const fromDate = parseOptionalDate(from, 'from');
  const toDate = parseOptionalDate(to, 'to');

  const query = {
    ...buildOverlapFilter({ from: fromDate, to: toDate }),
  };

  if (machineId) {
    query.machineId = machineId;
  }

  if (status) {
    if (!RUN_STATUSES.includes(status)) {
      throw new AppError('Geçersiz status filtresi.', 400);
    }
    query.status = status;
  }

  const cappedLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);

  return PlannedDowntimeRun.find(query)
    .sort({ scheduledStartAt: -1 })
    .limit(cappedLimit)
    .populate('machineId', 'code name isActive status currentJobOrder')
    .populate('ruleId', 'name reasonCode priority timezone type recurrence startAt endAt isActive')
    .populate('jobOrderId', 'orderNo status machine');
};

module.exports = {
  listRuns,
};

