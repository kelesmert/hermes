const asyncHandler = require('../utils/async-handler');
const AppError = require('../utils/app-error');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../domains/auth/models/user-model');

const authGuard = asyncHandler(async (req, _res, next) => {
  const authorization = req.get('authorization') || '';
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    throw new AppError('Kimlik doğrulaması gerekli.', 401);
  }

  const token = authorization.split(' ')[1];
  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw new AppError('Geçersiz veya süresi dolmuş erişim tokenı.', 401);
  }

  const user = await User.findById(payload.sub).populate({
    path: 'roles',
    populate: { path: 'permissions' },
  });

  if (!user || !user.isActive) {
    throw new AppError('Kullanıcı hesabı bulunamadı veya pasif.', 401);
  }

  const roleNames = (user.roles || []).map((role) => role?.name).filter(Boolean);
  const permissionNames = [
    ...new Set(
      (user.roles || []).flatMap((role) =>
        (role.permissions || []).map((permission) => permission?.name).filter(Boolean),
      ),
    ),
  ];

  req.auth = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    roles: roleNames,
    permissions: permissionNames,
  };

  next();
});

module.exports = authGuard;
