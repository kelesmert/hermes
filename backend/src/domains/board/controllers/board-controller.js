const asyncHandler = require('../../../utils/async-handler');
const boardService = require('../services/board-service');

const getBoardMetrics = asyncHandler(async (_req, res) => {
  const metrics = await boardService.getBoardMetrics();
  res.json(metrics);
});

const getMachineMetrics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { source } = req.query;
  const summary = await boardService.getMachineTelemetrySummary(id, { source });
  res.json(summary);
});

const getMachineTelemetrySeries = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit, since, view, bucketMinutes, source } = req.query;
  const payload = await boardService.getMachineTelemetrySeries(id, {
    limit,
    since,
    view,
    bucketMinutes,
    source,
  });
  res.json(payload);
});

const getOperationsDashboard = asyncHandler(async (req, res) => {
  const { source, shiftDate } = req.query;
  const payload = await boardService.getOperationsDashboard({ source, shiftDate });
  res.json(payload);
});

module.exports = {
  getBoardMetrics,
  getMachineMetrics,
  getMachineTelemetrySeries,
  getOperationsDashboard,
};
