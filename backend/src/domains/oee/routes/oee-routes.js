const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requireAnyPermission } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const oeeController = require('../controllers/oee-controller');

const router = Router();

router.use(authGuard);

router.get(
  '/reasons',
  requireAnyPermission(permissions.WORK_ORDERS_EXECUTE, permissions.PRODUCTION_MANAGE),
  oeeController.getReasonCatalog,
);

module.exports = router;

