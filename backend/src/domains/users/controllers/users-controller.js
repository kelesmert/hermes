const mongoose = require('mongoose');
const User = require('../../auth/models/user-model');
const Role = require('../../auth/models/role-model');
const asyncHandler = require('../../../utils/async-handler');
const AppError = require('../../../utils/app-error');
const { hashPassword } = require('../../../utils/password');

const formatUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  roles: (user.roles || []).map((role) => ({
    id: role._id,
    name: role.name,
    label: role.label,
  })),
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .select('firstName lastName email roles isActive createdAt')
    .populate('roles', 'name label');

  res.json({
    users: users.map(formatUser),
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, roleIds = [], isActive = true } = req.body || {};

  if (!firstName || !lastName || !email || !password) {
    throw new AppError('Ad, soyad, e-posta ve şifre zorunludur.', 400);
  }

  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    throw new AppError('Kullanıcı en az bir role sahip olmalıdır.', 400);
  }

  const invalidRoleId = roleIds.some((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidRoleId) {
    throw new AppError('Geçersiz rol id formatı.', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Bu e-posta ile kullanıcı zaten mevcut.', 409);
  }

  const rolesDocs = await Role.find({ _id: { $in: roleIds } });
  if (rolesDocs.length !== roleIds.length) {
    throw new AppError('Belirtilen rollerden biri bulunamadı.', 400);
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    passwordHash,
    roles: rolesDocs.map((role) => role._id),
    isActive: Boolean(isActive),
  });

  await user.populate('roles', 'name label');

  res.status(201).json({ user: formatUser(user) });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Geçersiz kullanıcı id formatı.', 400);
  }

  const user = await User.findById(id).select('+passwordHash').populate('roles', 'name label');
  if (!user) {
    throw new AppError('Kullanıcı bulunamadı.', 404);
  }

  const { firstName, lastName, email, password, roleIds, isActive } = req.body || {};

  if (email && email.toLowerCase() !== user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
    if (existingUser) {
      throw new AppError('Bu e-posta başka bir kullanıcı tarafından kullanılıyor.', 409);
    }
    user.email = email.toLowerCase();
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  if (typeof isActive === 'boolean') {
    user.isActive = isActive;
  }

  if (password) {
    user.passwordHash = await hashPassword(password);
  }

  if (Array.isArray(roleIds)) {
    if (roleIds.length === 0) {
      throw new AppError('Kullanıcı en az bir role sahip olmalıdır.', 400);
    }
    const invalidRoleId = roleIds.some((roleId) => !mongoose.Types.ObjectId.isValid(roleId));
    if (invalidRoleId) {
      throw new AppError('Geçersiz rol id formatı.', 400);
    }
    const rolesDocs = await Role.find({ _id: { $in: roleIds } });
    if (rolesDocs.length !== roleIds.length) {
      throw new AppError('Belirtilen rollerden biri bulunamadı.', 400);
    }
    user.roles = rolesDocs.map((role) => role._id);
  }

  await user.save();
  await user.populate('roles', 'name label');

  res.json({ user: formatUser(user) });
});

module.exports = {
  listUsers,
  createUser,
  updateUser,
};
