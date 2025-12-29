const asyncHandler = require('../../../utils/async-handler');
const AppError = require('../../../utils/app-error');
const jobOrderService = require('../services/job-order-service');

const listJobOrders = asyncHandler(async (req, res) => {
  const jobOrders = await jobOrderService.listJobOrders(req.query);
  res.json({ jobOrders });
});

const getJobOrder = asyncHandler(async (req, res) => {
  const jobOrder = await jobOrderService.getJobOrderById(req.params.id);
  res.json({ jobOrder });
});

const createJobOrder = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    createdBy: req.auth?.userId,
    source: 'operator',
  };
  const jobOrder = await jobOrderService.createJobOrder(payload);
  res.status(201).json({ jobOrder });
});

const updateJobOrder = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    updatedBy: req.auth?.userId,
    source: 'operator',
  };
  const jobOrder = await jobOrderService.updateJobOrder(req.params.id, payload);
  res.json({ jobOrder });
});

const deleteJobOrder = asyncHandler(async (req, res) => {
  await jobOrderService.deleteJobOrder(req.params.id);
  res.status(204).send();
});

const startJobOrder = asyncHandler(async (req, res) => {
  const jobOrder = await jobOrderService.startJobOrder(req.params.id, {
    operatorId: req.auth?.userId,
    source: 'operator',
    timeSource: req.body?.timeSource || req.body?.simulationSource,
  });
  res.json({ jobOrder });
});

const pauseJobOrder = asyncHandler(async (req, res) => {
  const jobOrder = await jobOrderService.pauseJobOrder(req.params.id, {
    operatorId: req.auth?.userId,
    source: req.body?.source || 'operator',
    reason: req.body?.reason,
    skipMachineEvent: true,
    timeSource: req.body?.timeSource || req.body?.simulationSource,
  });
  res.json({ jobOrder });
});

const resumeJobOrder = asyncHandler(async (req, res) => {
  const jobOrder = await jobOrderService.resumeJobOrder(req.params.id, {
    operatorId: req.auth?.userId,
    source: 'operator',
    skipMachineEvent: true,
    timeSource: req.body?.timeSource || req.body?.simulationSource,
  });
  res.json({ jobOrder });
});

const completeJobOrder = asyncHandler(async (req, res) => {
  const jobOrder = await jobOrderService.completeJobOrder(req.params.id, {
    operatorId: req.auth?.userId,
    source: 'operator',
    timeSource: req.body?.timeSource || req.body?.simulationSource,
  });
  res.json({ jobOrder });
});

const cancelJobOrder = asyncHandler(async (req, res) => {
  const jobOrder = await jobOrderService.cancelJobOrder(req.params.id, {
    operatorId: req.auth?.userId,
    source: 'operator',
    reason: req.body?.reason,
    timeSource: req.body?.timeSource || req.body?.simulationSource,
  });
  res.json({ jobOrder });
});

const recordProduction = asyncHandler(async (req, res) => {
  if (!req.body || req.body.quantity === undefined) {
    throw new AppError('Miktar zorunludur.', 400);
  }
  const jobOrder = await jobOrderService.recordProduction(req.params.id, {
    operatorId: req.auth?.userId,
    quantity: req.body.quantity,
    qualityStatus: req.body.qualityStatus || 'good',
    defectType: req.body.defectType,
    source: req.body.source || 'operator',
  });
  res.json({ jobOrder });
});

const listEvents = asyncHandler(async (req, res) => {
  const events = await jobOrderService.listProductionEvents(req.params.id, req.query);
  res.json({ events });
});

module.exports = {
  listJobOrders,
  getJobOrder,
  createJobOrder,
  updateJobOrder,
  deleteJobOrder,
  startJobOrder,
  pauseJobOrder,
  resumeJobOrder,
  completeJobOrder,
  cancelJobOrder,
  recordProduction,
  listEvents,
};
