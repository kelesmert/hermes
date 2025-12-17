const asyncHandler = require('../../../utils/async-handler');
const runService = require('../services/planned-downtime-run-service');

const listRuns = asyncHandler(async (req, res) => {
  const runs = await runService.listRuns(req.query);
  res.json({ runs });
});

module.exports = {
  listRuns,
};

