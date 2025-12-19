const asyncHandler = require('../../../utils/async-handler');
const simulationsService = require('../services/simulations-service');

const listSimulations = asyncHandler(async (_req, res) => {
  res.json(simulationsService.listSimulations());
});

const startSimulation = asyncHandler(async (req, res) => {
  const result = await simulationsService.startSimulation(req.params.name, {
    requestedBy: req.auth ? { userId: req.auth.userId, username: req.auth.username } : null,
  });
  res.status(202).json(result);
});

const stopSimulation = asyncHandler(async (req, res) => {
  const result = await simulationsService.stopSimulation(req.params.name, {
    requestedBy: req.auth ? { userId: req.auth.userId, username: req.auth.username } : null,
  });
  res.status(202).json(result);
});

const getLogs = asyncHandler(async (req, res) => {
  const { afterId, limit } = req.query;
  res.json(
    simulationsService.getLogs(req.params.name, {
      afterId,
      limit,
    }),
  );
});

const clearLogs = asyncHandler(async (req, res) => {
  res.json(simulationsService.clearLogs(req.params.name));
});

const resetSimulationData = asyncHandler(async (req, res) => {
  const result = await simulationsService.resetSimulationData(req.params.name, {
    requestedBy: req.auth ? { userId: req.auth.userId, username: req.auth.username } : null,
  });
  res.status(202).json(result);
});

module.exports = {
  listSimulations,
  startSimulation,
  stopSimulation,
  getLogs,
  clearLogs,
  resetSimulationData,
};
