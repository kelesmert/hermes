const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requireAnyPermission } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const permissionController = require('../controllers/permission-controller');

const router = Router();

router.use(authGuard);

router.get(
  '/',
  requireAnyPermission(permissions.ROLES_MANAGE, permissions.USERS_MANAGE),
  permissionController.listPermissions,
);

module.exports = router;
