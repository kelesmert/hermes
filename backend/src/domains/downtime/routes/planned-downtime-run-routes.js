const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requireAnyPermission } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const controller = require('../controllers/planned-downtime-run-controller');

const router = Router();

router.use(authGuard);

router.get(
  '/',
  requireAnyPermission(permissions.WORK_ORDERS_EXECUTE, permissions.PRODUCTION_MANAGE),
  controller.listRuns,
);

module.exports = router;

