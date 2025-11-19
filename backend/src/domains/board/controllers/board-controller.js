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
  const { limit, since, windowMs } = req.query;
  const payload = await boardService.getMachineTelemetrySeries(id, {
    limit,
    since,
    windowMs,
  });
  res.json(payload);
});

const getMachineTelemetryTrend = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rangeHours, binMinutes } = req.query;
  const payload = await boardService.getMachineTelemetryTrend(id, {
    rangeHours,
    binMinutes,
  });
  res.json(payload);
});

module.exports = {
  getBoardMetrics,
  getMachineMetrics,
  getMachineTelemetrySeries,
  getMachineTelemetryTrend,
};
