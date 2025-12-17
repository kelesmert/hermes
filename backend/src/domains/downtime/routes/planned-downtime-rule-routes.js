const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requireAnyPermission, requirePermissions } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const controller = require('../controllers/planned-downtime-rule-controller');

const router = Router();

router.use(authGuard);

router.get(
  '/',
  requireAnyPermission(permissions.WORK_ORDERS_EXECUTE, permissions.PRODUCTION_MANAGE),
  controller.listRules,
);

router.post('/', requirePermissions(permissions.PRODUCTION_MANAGE), controller.createRule);

router.patch('/:id', requirePermissions(permissions.PRODUCTION_MANAGE), controller.updateRule);

router.delete('/:id', requirePermissions(permissions.PRODUCTION_MANAGE), controller.deleteRule);

module.exports = router;

