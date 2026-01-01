const mongoose = require('mongoose');
const Machine = require('../models/machine-model');
const User = require('../../auth/models/user-model');
const AppError = require('../../../utils/app-error');

const resolveUserId = async (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError('Geçersiz kullanıcı id formatı.', 400);
  }
  const user = await User.findById(value).select('_id');
  if (!user) {
    throw new AppError('Kullanıcı bulunamadı.', 404);
  }
  return user._id;
};

const ensureMachine = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Geçersiz makine id formatı.', 400);
    }
  const machine = await Machine.findById(id);
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }
  return machine;
};

const listMachines = async () => {
  return Machine.find().sort({ createdAt: -1 });
};

const getMachine = async (id) => ensureMachine(id);

const createMachine = async (payload) => {
  const { code, name, tags = [], isActive = true, responsibleUser } = payload;

  if (!code || !name) {
    throw new AppError('Makine kodu ve adı zorunludur.', 400);
  }

  const existing = await Machine.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    throw new AppError('Bu kodla kayıtlı bir makine zaten mevcut.', 409);
  }

  const resolvedResponsibleUser = await resolveUserId(responsibleUser);

  const machine = await Machine.create({
    code: code.trim().toUpperCase(),
    name: name.trim(),
    tags,
    isActive: Boolean(isActive),
    ...(resolvedResponsibleUser && { responsibleUser: resolvedResponsibleUser }),
  });

  return machine;
};

const updateMachine = async (id, payload) => {
  const machine = await ensureMachine(id);
  const { code, name, tags, isActive, responsibleUser } = payload;

  if (code && code.trim().toUpperCase() !== machine.code) {
    const existing = await Machine.findOne({ code: code.trim().toUpperCase(), _id: { $ne: id } });
    if (existing) {
      throw new AppError('Bu kodla kayıtlı başka bir makine mevcut.', 409);
    }
    machine.code = code.trim().toUpperCase();
  }

  if (name) {
    machine.name = name.trim();
  }
  if (Array.isArray(tags)) {
    machine.tags = tags;
  }
  if (typeof isActive === 'boolean') {
    machine.isActive = isActive;
  }
  if (responsibleUser !== undefined) {
    const resolvedResponsibleUser = await resolveUserId(responsibleUser);
    machine.responsibleUser = resolvedResponsibleUser || null;
  }

  await machine.save();
  return machine;
};

const deleteMachine = async (id) => {
  const machine = await ensureMachine(id);
  await Machine.deleteOne({ _id: machine._id });
};

module.exports = {
  listMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
};
