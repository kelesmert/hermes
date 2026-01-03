const { buildHash } = require('./hash-utils');

const buildOeeSnapshotPayload = ({ stats, lossBreakdown }) => {
  const topReasons = (lossBreakdown?.topReasons || []).map((item) => ({
    code: item.code,
    durationMs: item.durationMs,
    category: item.category,
  }));

  return {
    oee: stats?.oee ?? null,
    availability: stats?.availability ?? null,
    performance: stats?.performance ?? null,
    quality: stats?.quality ?? null,
    plannedTimeMs: stats?.plannedTime ?? 0,
    operatingTimeMs: stats?.operatingTime ?? 0,
    goodCount: stats?.goodCount ?? 0,
    defectCount: stats?.defectCount ?? 0,
    topReasons,
  };
};

const buildOeeSnapshotHash = ({ stats, lossBreakdown }) => {
  const payload = buildOeeSnapshotPayload({ stats, lossBreakdown });
  return buildHash(payload);
};

module.exports = {
  buildOeeSnapshotPayload,
  buildOeeSnapshotHash,
};
