const asyncHandler = require('../../../utils/async-handler');
const boardService = require('../services/board-service');

const getBoardMetrics = asyncHandler(async (_req, res) => {
  const metrics = await boardService.getBoardMetrics();
  res.json(metrics);
});

const getMachineMetrics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const summary = await boardService.getMachineTelemetrySummary(id);
  res.json(summary);
});

const getMachineTelemetrySeries = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit, since } = req.query;
  const payload = await boardService.getMachineTelemetrySeries(id, { limit, since });
  res.json(payload);
});

module.exports = {
  getBoardMetrics,
  getMachineMetrics,
  getMachineTelemetrySeries,
};
