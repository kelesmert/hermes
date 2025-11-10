const AppError = require('../utils/app-error');

const formatPermissions = (permissions) => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) {
    return permissions.flatMap((permission) => formatPermissions(permission));
  }
  return [permissions];
};

const requirePermissions = (...requiredPermissions) => {
  const permissions = [...new Set(formatPermissions(requiredPermissions).filter(Boolean))];

  return (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError('Kimlik doğrulaması gerekli.', 401));
    }

    const userPermissions = req.auth.permissions || [];
    const hasAllPermissions = permissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      return next(new AppError('Bu işlem için yetkiniz yok.', 403));
    }

    return next();
  };
};

const requireAnyPermission = (...possiblePermissions) => {
  const permissions = [...new Set(formatPermissions(possiblePermissions).filter(Boolean))];

  return (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError('Kimlik doğrulaması gerekli.', 401));
    }

    const userPermissions = req.auth.permissions || [];
    const hasAnyPermission = permissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAnyPermission) {
      return next(new AppError('Bu işlem için yetkiniz yok.', 403));
    }

    return next();
  };
};

module.exports = {
  requirePermissions,
  requireAnyPermission,
};
