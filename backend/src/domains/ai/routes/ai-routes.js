const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requireAnyPermission, requirePermissions } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const aiController = require('../controllers/ai-controller');

const router = Router();

router.use(authGuard);

router.get(
  '/health',
  requireAnyPermission(permissions.REPORTS_READ, permissions.MACHINES_READ),
  aiController.getHealth,
);

router.get(
  '/insights',
  requireAnyPermission(permissions.REPORTS_READ, permissions.MACHINES_READ),
  aiController.listInsights,
);

router.get(
  '/insights/latest',
  requireAnyPermission(permissions.REPORTS_READ, permissions.MACHINES_READ),
  aiController.getLatestInsight,
);

router.get(
  '/insights/:id',
  requireAnyPermission(permissions.REPORTS_READ, permissions.MACHINES_READ),
  aiController.getInsightById,
);

router.post(
  '/oee-insight',
  requirePermissions(permissions.REPORTS_READ),
  aiController.createOeeInsight,
);

router.post(
  '/downtime-reason',
  requireAnyPermission(permissions.MACHINES_READ),
  aiController.createDowntimeReason,
);

router.post(
  '/anomaly-risk',
  requireAnyPermission(permissions.MACHINES_READ),
  aiController.createAnomalyRisk,
);

module.exports = router;
