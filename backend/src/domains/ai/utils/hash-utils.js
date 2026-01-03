const crypto = require('crypto');

const normalizeNumber = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return value;
  return Number(value.toFixed(4));
};

const normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeValue(value[key]);
        return acc;
      }, {});
  }
  return normalizeNumber(value);
};

const stableStringify = (value) => JSON.stringify(normalizeValue(value));

const buildHash = (payload) => {
  const raw = stableStringify(payload || {});
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
};

module.exports = {
  buildHash,
  normalizeValue,
};
