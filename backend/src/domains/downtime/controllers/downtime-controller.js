const asyncHandler = require('../../../utils/async-handler');
const downtimeService = require('../services/downtime-service');

const listDowntimes = asyncHandler(async (req, res) => {
  const downtimes = await downtimeService.listDowntimes(req.query);
  res.json({ downtimes });
});

const updateDowntime = asyncHandler(async (req, res) => {
  const updated = await downtimeService.updateDowntime(req.params.id, req.body, {
    userId: req.auth?.userId,
  });
  res.json({ downtime: updated });
});

const splitDowntime = asyncHandler(async (req, res) => {
  const created = await downtimeService.splitDowntime(req.params.id, req.body, {
    userId: req.auth?.userId,
  });
  res.status(201).json({ downtime: created });
});

module.exports = {
  listDowntimes,
  updateDowntime,
  splitDowntime,
};

