const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requirePermissions, requireAnyPermission } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const roleController = require('../controllers/role-controller');

const router = Router();

router.use(authGuard);

router.get(
  '/',
  requireAnyPermission(permissions.ROLES_MANAGE, permissions.USERS_MANAGE),
  roleController.listRoles,
);

router.post('/', requirePermissions(permissions.ROLES_MANAGE), roleController.createRole);
router.patch('/:id', requirePermissions(permissions.ROLES_MANAGE), roleController.updateRole);
router.delete('/:id', requirePermissions(permissions.ROLES_MANAGE), roleController.deleteRole);

module.exports = router;
