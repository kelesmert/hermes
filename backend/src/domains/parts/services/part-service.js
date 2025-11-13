const Part = require('../models/part-model');
const Machine = require('../../machines/models/machine-model');
const AppError = require('../../../utils/app-error');

const getParts = async (filters = {}) => {
  const query = {};
  if (filters.search) {
    query.$or = [
      { code: { $regex: filters.search, $options: 'i' } },
      { name: { $regex: filters.search, $options: 'i' } },
    ];
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.machineId) {
    query.compatibleMachines = filters.machineId;
  }
  return Part.find(query).sort({ createdAt: -1 });
};

const getPartById = async (id) => Part.findById(id);

const createPart = async (payload) => {
  if (payload.compatibleMachines?.length) {
    const count = await Machine.countDocuments({ _id: { $in: payload.compatibleMachines } });
    if (count !== payload.compatibleMachines.length) {
      throw new AppError('Geçersiz makine seçimi yapıldı.', 400);
    }
  }
  return Part.create(payload);
};

const updatePart = async (id, payload) => {
  const part = await Part.findById(id);
  if (!part) throw new AppError('Parça bulunamadı.', 404);

  if (payload.compatibleMachines?.length) {
    const count = await Machine.countDocuments({ _id: { $in: payload.compatibleMachines } });
    if (count !== payload.compatibleMachines.length) {
      throw new AppError('Geçersiz makine seçimi yapıldı.', 400);
    }
  }

  Object.assign(part, payload);
  await part.save();
  return part;
};

const deletePart = async (id) => {
  const part = await Part.findById(id);
  if (!part) throw new AppError('Parça bulunamadı.', 404);
  await part.deleteOne();
};

module.exports = {
  getParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
};
