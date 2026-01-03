const {
  USE_CASE_RATE_LIMITS,
  DAILY_GLOBAL_LIMIT,
  MONTHLY_COST_CAP_USD,
  WARNING_THRESHOLD,
} = require('../utils/ai-constants');

const state = {
  perUser: new Map(),
  daily: new Map(),
  monthly: new Map(),
};

const pad = (value) => String(value).padStart(2, '0');

const getDateKey = (date) => {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  return `${year}-${month}-${day}`;
};

const getHourKey = (date) => {
  const dateKey = getDateKey(date);
  const hour = pad(date.getUTCHours());
  return `${dateKey}T${hour}`;
};

const getMonthKey = (date) => {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  return `${year}-${month}`;
};

const ensureUserBucket = (userId) => {
  if (!state.perUser.has(userId)) {
    state.perUser.set(userId, new Map());
  }
  return state.perUser.get(userId);
};

const ensureUseCaseBucket = (userBucket, useCase) => {
  if (!userBucket.has(useCase)) {
    userBucket.set(useCase, { hourKey: null, count: 0 });
  }
  return userBucket.get(useCase);
};

const checkAndConsume = ({ userId, useCase, estimatedCostUsd = 0, consume = true }) => {
  const now = new Date();
  const hourKey = getHourKey(now);
  const dateKey = getDateKey(now);
  const monthKey = getMonthKey(now);

  const limitConfig = USE_CASE_RATE_LIMITS[useCase] || { hourly: 5, avgCostUsd: 0 };
  const hourlyLimit = limitConfig.hourly;

  const userBucket = ensureUserBucket(userId);
  const useCaseBucket = ensureUseCaseBucket(userBucket, useCase);
  if (useCaseBucket.hourKey !== hourKey) {
    useCaseBucket.hourKey = hourKey;
    useCaseBucket.count = 0;
  }

  const dailyCount = state.daily.get(dateKey) || 0;
  const monthlyCost = state.monthly.get(monthKey) || 0;

  const projectedHourly = useCaseBucket.count + 1;
  const projectedDaily = dailyCount + 1;
  const projectedMonthlyCost = monthlyCost + estimatedCostUsd;

  const blocked =
    projectedHourly > hourlyLimit ||
    projectedDaily > DAILY_GLOBAL_LIMIT ||
    projectedMonthlyCost > MONTHLY_COST_CAP_USD;

  if (consume && !blocked) {
    useCaseBucket.count = projectedHourly;
    state.daily.set(dateKey, projectedDaily);
    state.monthly.set(monthKey, projectedMonthlyCost);
  }

  const rateLimitMeta = {
    hourlyUsed: consume && !blocked ? projectedHourly : useCaseBucket.count,
    hourlyLimit,
    dailyUsed: consume && !blocked ? projectedDaily : dailyCount,
    dailyLimit: DAILY_GLOBAL_LIMIT,
    monthlyCostUsd: consume && !blocked ? projectedMonthlyCost : monthlyCost,
    monthlyCapUsd: MONTHLY_COST_CAP_USD,
  };

  const hourlyRatio = rateLimitMeta.hourlyUsed / hourlyLimit;
  const dailyRatio = rateLimitMeta.dailyUsed / DAILY_GLOBAL_LIMIT;
  const monthlyRatio = rateLimitMeta.monthlyCostUsd / MONTHLY_COST_CAP_USD;

  rateLimitMeta.isWarning =
    hourlyRatio >= WARNING_THRESHOLD ||
    dailyRatio >= WARNING_THRESHOLD ||
    monthlyRatio >= WARNING_THRESHOLD;
  rateLimitMeta.isBlocked = blocked;

  return { allowed: !blocked, rateLimitMeta };
};

module.exports = {
  checkAndConsume,
};
