const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requireAnyPermission } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const downtimeController = require('../controllers/downtime-controller');

const router = Router();

router.use(authGuard);

router.get(
  '/',
  requireAnyPermission(permissions.WORK_ORDERS_EXECUTE, permissions.PRODUCTION_MANAGE),
  downtimeController.listDowntimes,
);

router.patch(
  '/:id',
  requireAnyPermission(permissions.WORK_ORDERS_EXECUTE, permissions.PRODUCTION_MANAGE),
  downtimeController.updateDowntime,
);

router.post(
  '/:id/split',
  requireAnyPermission(permissions.WORK_ORDERS_EXECUTE, permissions.PRODUCTION_MANAGE),
  downtimeController.splitDowntime,
);

module.exports = router;

