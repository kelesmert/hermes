const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');
const authService = require('../services/auth-service');

const requestMeta = (req) => ({
  userAgent: req.get('user-agent'),
  ipAddress: req.ip,
});

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, roleName, roles } = req.body || {};

  if (!firstName || !lastName || !email || !password) {
    throw new AppError('Ad, soyad, e-posta ve şifre zorunludur.', 400);
  }

  const user = await authService.registerUser({
    firstName,
    lastName,
    email,
    password,
    roleNames: roles || roleName,
  });

  res.status(201).json({ user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new AppError('E-posta ve şifre zorunludur.', 400);
  }

  const payload = await authService.loginUser({
    email,
    password,
    ...requestMeta(req),
  });

  res.json(payload);
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    throw new AppError('Refresh token gerekli.', 400);
  }

  const payload = await authService.refreshSession({
    refreshToken,
    ...requestMeta(req),
  });

  res.json(payload);
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    throw new AppError('Refresh token gerekli.', 400);
  }

  await authService.logoutUser({ refreshToken });

  res.status(204).send();
});

module.exports = {
  register,
  login,
  refresh,
  logout,
};
