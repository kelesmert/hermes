const AiUsage = require('../models/ai-usage-model');

const buildUsageExpiresAt = (createdAt = new Date()) => {
  const ms = 180 * 24 * 60 * 60 * 1000;
  return new Date(createdAt.getTime() + ms);
};

const createUsageLog = async (payload) => {
  const createdAt = payload?.createdAt ? new Date(payload.createdAt) : new Date();
  const expiresAt = payload?.expiresAt || buildUsageExpiresAt(createdAt);
  const doc = {
    ...payload,
    createdAt,
    expiresAt,
  };
  return AiUsage.create(doc);
};

module.exports = {
  createUsageLog,
  buildUsageExpiresAt,
};
