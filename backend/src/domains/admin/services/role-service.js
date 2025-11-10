const mongoose = require('mongoose');
const AppError = require('../../../utils/app-error');
const Role = require('../../auth/models/role-model');
const Permission = require('../../auth/models/permission-model');
const User = require('../../auth/models/user-model');
const roles = require('../../../constants/roles');

const formatRole = (roleDoc) => ({
  id: roleDoc._id,
  name: roleDoc.name,
  label: roleDoc.label,
  description: roleDoc.description,
  isDefault: roleDoc.isDefault,
  permissions: (roleDoc.permissions || []).map((permission) => ({
    id: permission._id,
    name: permission.name,
    label: permission.label,
    description: permission.description,
    category: permission.category,
  })),
});

const resolvePermissions = async (permissionIds = []) => {
  if (!permissionIds || permissionIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(permissionIds)].filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (uniqueIds.length !== permissionIds.length) {
    throw new AppError('Geçersiz permission id formatı tespit edildi.', 400);
  }

  const permissions = await Permission.find({ _id: { $in: uniqueIds } });
  if (permissions.length !== uniqueIds.length) {
    throw new AppError('Belirtilen izinlerden biri bulunamadı.', 400);
  }

  return permissions;
};

const listRoles = async () => {
  const roleDocs = await Role.find().populate('permissions').sort({ name: 1 });
  return roleDocs.map(formatRole);
};

const createRole = async ({ name, label, description, permissionIds = [], isDefault = false }) => {
  if (!name || !label) {
    throw new AppError('Rol adı ve etiketi zorunludur.', 400);
  }

  const normalizedName = name.toString().trim().toLowerCase();

  const existingRole = await Role.findOne({ name: normalizedName });
  if (existingRole) {
    throw new AppError('Bu isimde bir rol zaten mevcut.', 409);
  }

  const permissions = await resolvePermissions(permissionIds);

  const role = await Role.create({
    name: normalizedName,
    label: label.trim(),
    description,
    permissions: permissions.map((permission) => permission._id),
    isDefault: Boolean(isDefault),
  });

  await role.populate('permissions');

  return formatRole(role);
};

const updateRole = async (roleId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throw new AppError('Geçersiz rol id formatı.', 400);
  }

  const role = await Role.findById(roleId);
  if (!role) {
    throw new AppError('Rol bulunamadı.', 404);
  }

  if (payload.name && payload.name.toLowerCase() !== role.name) {
    const normalizedName = payload.name.toString().trim().toLowerCase();
    const sameNameRole = await Role.findOne({ name: normalizedName, _id: { $ne: roleId } });
    if (sameNameRole) {
      throw new AppError('Bu isimde başka bir rol zaten mevcut.', 409);
    }
    role.name = normalizedName;
  }

  if (payload.label) {
    role.label = payload.label.trim();
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    role.description = payload.description;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'isDefault')) {
    role.isDefault = Boolean(payload.isDefault);
  }
  if (Array.isArray(payload.permissionIds)) {
    const permissions = await resolvePermissions(payload.permissionIds);
    role.permissions = permissions.map((permission) => permission._id);
  }

  await role.save();
  await role.populate('permissions');
  return formatRole(role);
};

const deleteRole = async (roleId) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throw new AppError('Geçersiz rol id formatı.', 400);
  }

  const role = await Role.findById(roleId);
  if (!role) {
    throw new AppError('Silinecek rol bulunamadı.', 404);
  }

  if (role.name === roles.VIEWER) {
    throw new AppError('Viewer rolü silinemez.', 400);
  }

  const viewerRole = await Role.findOne({ name: roles.VIEWER });
  if (!viewerRole) {
    throw new AppError('Viewer rolü bulunamadı, lütfen seed işlemini kontrol edin.', 500);
  }

  const usersWithRole = await User.find({ roles: roleId });

  // Rol tek kalan kullanıcıları viewer rolüne aktar
  await Promise.all(
    usersWithRole.map(async (user) => {
      const filteredRoles = user.roles.filter(
        (assignedRoleId) => assignedRoleId.toString() !== roleId.toString(),
      );
      if (filteredRoles.length === 0) {
        filteredRoles.push(viewerRole._id);
      }
      user.roles = filteredRoles;
      await user.save();
    }),
  );

  await Role.deleteOne({ _id: roleId });

  return {
    deletedRoleId: roleId,
    reassignedUserCount: usersWithRole.length,
  };
};

module.exports = {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
};
