const asyncHandler = require('../../../utils/async-handler');
const AppError = require('../../../utils/app-error');
const machineService = require('../services/machine-service');

const listMachines = asyncHandler(async (_req, res) => {
  const machines = await machineService.listMachines();
  res.json({ machines });
});

const getMachine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const machine = await machineService.getMachine(id);
  res.json({ machine });
});

const createMachine = asyncHandler(async (req, res) => {
  const machine = await machineService.createMachine(req.body || {});
  res.status(201).json({ machine });
});

const updateMachine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const machine = await machineService.updateMachine(id, req.body || {});
  res.json({ machine });
});

const deleteMachine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { force } = req.query;
  if (force !== 'true') {
    throw new AppError('Makine silme işlemleri için `?force=true` parametresi gereklidir.', 400);
  }
  await machineService.deleteMachine(id);
  res.status(204).send();
});

module.exports = {
  listMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
};
