const buildWindowKey = (window) => {
  if (!window || !window.mode) return null;
  const timezone = window.timezone || 'Europe/Istanbul';
  if (window.mode === 'shift') {
    if (!window.shiftDateYmd) return null;
    return `shift|${window.shiftDateYmd}|${timezone}`;
  }
  if (window.mode === 'range') {
    if (typeof window.fromMs !== 'number' || typeof window.toMs !== 'number') return null;
    return `range|${window.fromMs}|${window.toMs}|${timezone}`;
  }
  return null;
};

const toWindowPayload = ({ mode, shiftDateYmd, fromMs, toMs, timezone }) => ({
  mode,
  shiftDateYmd,
  fromMs,
  toMs,
  timezone: timezone || 'Europe/Istanbul',
});

module.exports = {
  buildWindowKey,
  toWindowPayload,
};
