const Part = require('../models/part-model');
const Machine = require('../../machines/models/machine-model');
const AppError = require('../../../utils/app-error');
const { getCategoryConfig } = require('../constants/part-categories');

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

const normalizeCompatibleMachines = async (machineIds) => {
  if (!Array.isArray(machineIds)) return undefined;
  if (machineIds.length === 0) return [];
  const formatted = machineIds.map((id) => id?.toString?.() || id);
  const count = await Machine.countDocuments({ _id: { $in: formatted } });
  if (count !== formatted.length) {
    throw new AppError('Geçersiz makine seçimi yapıldı.', 400);
  }
  return formatted;
};

const normalizeCategoryPayload = (payload, fallbackCategory) => {
  const categoryId = (payload.category || fallbackCategory || '').trim().toLowerCase();
  const categoryConfig = getCategoryConfig(categoryId);
  if (!categoryConfig) {
    throw new AppError('Geçersiz kategori seçildi.', 400);
  }
  return { categoryId: categoryConfig.id, categoryConfig };
};

const normalizeUnit = (unit, categoryConfig, existingUnit) => {
  const selected = unit?.trim() || existingUnit || categoryConfig.defaultUnit || categoryConfig.units[0];
  if (!categoryConfig.units.includes(selected)) {
    throw new AppError('Seçili kategori için geçersiz birim değeri.', 400);
  }
  return selected;
};

const normalizeDefaultSettings = (settings, categoryConfig) => {
  if (settings === undefined) return undefined;
  if (settings === null) return undefined;
  const result = {};
  categoryConfig.machineSettings.forEach((field) => {
    const raw = settings[field.key];
    if (raw === undefined || raw === '' || raw === null) return;
    if (field.type === 'number') {
      const numeric = Number(raw);
      if (Number.isNaN(numeric)) {
        throw new AppError(`${field.label} alanı sayısal olmalıdır.`, 400);
      }
      result[field.key] = numeric;
    } else {
      result[field.key] = String(raw);
    }
  });
  return Object.keys(result).length ? result : undefined;
};

const normalizeIdealCycleTime = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw new AppError('İdeal çevrim süresi zorunludur.', 400);
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < 0) {
    throw new AppError('İdeal çevrim süresi geçerli bir sayı olmalıdır.', 400);
  }
  return numeric;
};

const normalizeTags = (tags) => {
  if (!tags) return undefined;
  return tags.filter(Boolean);
};

const createPart = async (payload) => {
  const compatibleMachines = await normalizeCompatibleMachines(payload.compatibleMachines);
  const { categoryId, categoryConfig } = normalizeCategoryPayload(payload, null);

  const data = {
    code: payload.code?.trim(),
    name: payload.name?.trim(),
    description: payload.description?.trim() || '',
    category: categoryId,
    unit: normalizeUnit(payload.unit, categoryConfig),
    tags: normalizeTags(payload.tags) || [],
    idealCycleTime: normalizeIdealCycleTime(payload.idealCycleTime),
    defaultMachineSettings: normalizeDefaultSettings(payload.defaultMachineSettings, categoryConfig),
    createdBy: payload.createdBy,
  };

  if (!data.code) {
    throw new AppError('Parça kodu zorunludur.', 400);
  }
  if (!data.name) {
    throw new AppError('Parça adı zorunludur.', 400);
  }

  if (compatibleMachines !== undefined) {
    data.compatibleMachines = compatibleMachines;
  }

  return Part.create(data);
};

const updatePart = async (id, payload) => {
  const part = await Part.findById(id);
  if (!part) throw new AppError('Parça bulunamadı.', 404);

  const compatibleMachines = await normalizeCompatibleMachines(payload.compatibleMachines);
  const { categoryId, categoryConfig } = normalizeCategoryPayload(payload, part.category);
  const updates = {};

  if (payload.name !== undefined) updates.name = payload.name?.trim();
  if (payload.description !== undefined) updates.description = payload.description?.trim() || '';
  if (payload.category !== undefined) updates.category = categoryId;
  if (payload.unit !== undefined) {
    updates.unit = normalizeUnit(payload.unit, categoryConfig, part.unit);
  } else if (!categoryConfig.units.includes(part.unit)) {
    updates.unit = normalizeUnit(undefined, categoryConfig, part.unit);
  }
  if (payload.tags !== undefined) {
    updates.tags = normalizeTags(payload.tags) || [];
  }
  if (payload.idealCycleTime !== undefined) {
    updates.idealCycleTime = normalizeIdealCycleTime(payload.idealCycleTime, part.idealCycleTime);
  }
  if (payload.defaultMachineSettings !== undefined) {
    updates.defaultMachineSettings = normalizeDefaultSettings(payload.defaultMachineSettings, categoryConfig);
  }
  if (compatibleMachines !== undefined) {
    updates.compatibleMachines = compatibleMachines;
  }

  Object.assign(part, updates);
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
