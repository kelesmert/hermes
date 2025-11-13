const asyncHandler = require('../../../utils/async-handler');
const AppError = require('../../../utils/app-error');
const partService = require('../services/part-service');

const listParts = asyncHandler(async (req, res) => {
  const parts = await partService.getParts(req.query);
  res.json(parts);
});

const getPart = asyncHandler(async (req, res) => {
  const part = await partService.getPartById(req.params.id);
  if (!part) throw new AppError('Parça bulunamadı.', 404);
  res.json(part);
});

const createPart = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    createdBy: req.auth?.userId,
  };
  const part = await partService.createPart(payload);
  res.status(201).json(part);
});

const updatePart = asyncHandler(async (req, res) => {
  const part = await partService.updatePart(req.params.id, req.body);
  res.json(part);
});

const deletePart = asyncHandler(async (req, res) => {
  await partService.deletePart(req.params.id);
  res.status(204).send();
});

module.exports = {
  listParts,
  getPart,
  createPart,
  updatePart,
  deletePart,
};
