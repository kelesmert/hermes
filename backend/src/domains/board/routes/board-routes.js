const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requirePermissions } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const boardController = require('../controllers/board-controller');

const router = Router();

router.use(authGuard);

router.get(
  '/metrics',
  requirePermissions(permissions.DASHBOARD_READ),
  boardController.getBoardMetrics,
);

router.get(
  '/machines/:id/metrics',
  requirePermissions(permissions.DASHBOARD_READ),
  boardController.getMachineMetrics,
);

router.get(
  '/machines/:id/telemetry',
  requirePermissions(permissions.DASHBOARD_READ),
  boardController.getMachineTelemetrySeries,
);

module.exports = router;
