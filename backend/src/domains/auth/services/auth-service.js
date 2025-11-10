const User = require('../models/user-model');
const Role = require('../models/role-model');
const AppError = require('../../../utils/app-error');
const { hashPassword } = require('../../../utils/password');
const { signAccessToken } = require('../../../utils/jwt');
const {
  saveRefreshToken,
  findActiveRefreshToken,
  replaceRefreshToken,
  deleteRefreshToken,
} = require('./token-service');
const roles = require('../../../constants/roles');

const populateUserRoles = (userDoc) =>
  userDoc.populate({
    path: 'roles',
    populate: { path: 'permissions' },
  });

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const userObj = userDoc.toObject({ getters: true, versionKey: false });
  delete userObj.passwordHash;
  if (Array.isArray(userObj.roles)) {
    userObj.roles = userObj.roles
      .filter(Boolean)
      .map((role) =>
        role?.name
          ? {
              id: role._id,
              name: role.name,
              label: role.label,
              permissions: (role.permissions || [])
                .filter((permission) => permission?.name)
                .map((permission) => ({
                  id: permission._id,
                  name: permission.name,
                  label: permission.label,
                  category: permission.category,
                })),
            }
          : role,
      );
  }
  return userObj;
};

const normalizeRoleInput = (roleInput) => {
  if (!roleInput) return null;
  if (Array.isArray(roleInput)) {
    return roleInput.map((role) => role?.toString()?.toLowerCase()).filter(Boolean);
  }
  return [roleInput.toString().toLowerCase()];
};

const resolveRoles = async (roleInput) => {
  const desiredRoles = normalizeRoleInput(roleInput);

  if (desiredRoles && desiredRoles.length) {
    const roleDocs = await Role.find({ name: { $in: desiredRoles } });
    if (roleDocs.length !== desiredRoles.length) {
      throw new AppError('Belirtilen rollerden biri bulunamadı. Lütfen veri setini kontrol edin.', 400);
    }
    return roleDocs;
  }

  const defaultRoles = await Role.find({ isDefault: true });
  if (defaultRoles.length > 0) {
    return defaultRoles;
  }

  const fallbackRole = await Role.findOne({ name: roles.OPERATOR });
  if (!fallbackRole) {
    throw new AppError('Varsayılan rol bulunamadı. Lütfen rol verilerini ekleyin.', 400);
  }

  return [fallbackRole];
};

const buildAuthTokens = async (userDoc, context) => {
  const accessToken = signAccessToken({
    sub: userDoc._id.toString(),
    roles: (userDoc.roles || []).map((role) => role?.name).filter(Boolean),
  });

  const { tokenValue: refreshToken } = await saveRefreshToken({
    userId: userDoc._id,
    userAgent: context?.userAgent,
    ipAddress: context?.ipAddress,
  });

  return { accessToken, refreshToken };
};

const registerUser = async (payload) => {
  const { firstName, lastName, email, password, roleNames } = payload;

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError('Bu e-posta ile kullanıcı zaten mevcut.', 409);
  }

  const rolesDocs = await resolveRoles(roleNames);
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    passwordHash,
    roles: rolesDocs.map((roleDoc) => roleDoc._id),
  });

  await populateUserRoles(user);

  return sanitizeUser(user);
};

const loginUser = async ({ email, password, userAgent, ipAddress }) => {
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
    .select('+passwordHash')
    .populate({
      path: 'roles',
      populate: { path: 'permissions' },
    });

  if (!user) {
    throw new AppError('E-posta veya şifre hatalı.', 401);
  }

  if ((!user.roles || user.roles.length === 0) && user.role) {
    const legacyRoleId = user.role._id || user.role;
    user.roles = [legacyRoleId];
    user.role = undefined;
    await populateUserRoles(user);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('E-posta veya şifre hatalı.', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await buildAuthTokens(user, { userAgent, ipAddress });

  return {
    user: sanitizeUser(user),
    tokens,
  };
};

const refreshSession = async ({ refreshToken, userAgent, ipAddress }) => {
  const existingToken = await findActiveRefreshToken(refreshToken);

  if (!existingToken) {
    throw new AppError('Refresh token geçersiz veya süresi dolmuş.', 401);
  }

  await existingToken.populate({
    path: 'user',
    populate: {
      path: 'roles',
      populate: { path: 'permissions' },
    },
  });

  if (!existingToken.user.isActive) {
    throw new AppError('Kullanıcı pasif durumda.', 403);
  }

  const { tokenValue: newRefreshToken } = await replaceRefreshToken(existingToken, {
    userAgent,
    ipAddress,
  });

  const newAccessToken = signAccessToken({
    sub: existingToken.user._id.toString(),
    roles: (existingToken.user.roles || []).map((role) => role?.name).filter(Boolean),
  });

  return {
    user: sanitizeUser(existingToken.user),
    tokens: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  };
};

const logoutUser = async ({ refreshToken }) => {
  if (!refreshToken) return;
  await deleteRefreshToken(refreshToken);
};

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
};
