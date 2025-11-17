const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requirePermissions, requireAnyPermission } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const jobOrderController = require('../controllers/job-order-controller');

const router = Router();

const requireProductionRead = requireAnyPermission(
  permissions.PRODUCTION_READ,
  permissions.PRODUCTION_MANAGE,
  permissions.WORK_ORDERS_EXECUTE,
);

const requireProductionWrite = requirePermissions(permissions.PRODUCTION_MANAGE);
const requireExecutionPermission = requireAnyPermission(
  permissions.PRODUCTION_MANAGE,
  permissions.WORK_ORDERS_EXECUTE,
);

router.use(authGuard);

router
  .route('/job-orders')
  .get(requireProductionRead, jobOrderController.listJobOrders)
  .post(requireProductionWrite, jobOrderController.createJobOrder);

router
  .route('/job-orders/:id')
  .get(requireProductionRead, jobOrderController.getJobOrder)
  .patch(requireProductionWrite, jobOrderController.updateJobOrder)
  .delete(requireProductionWrite, jobOrderController.deleteJobOrder);

router.get(
  '/job-orders/:id/events',
  requireProductionRead,
  jobOrderController.listEvents,
);

router.post(
  '/job-orders/:id/start',
  requireExecutionPermission,
  jobOrderController.startJobOrder,
);
router.post(
  '/job-orders/:id/pause',
  requireExecutionPermission,
  jobOrderController.pauseJobOrder,
);
router.post(
  '/job-orders/:id/resume',
  requireExecutionPermission,
  jobOrderController.resumeJobOrder,
);
router.post(
  '/job-orders/:id/complete',
  requireExecutionPermission,
  jobOrderController.completeJobOrder,
);
router.post(
  '/job-orders/:id/cancel',
  requireProductionWrite,
  jobOrderController.cancelJobOrder,
);
router.post(
  '/job-orders/:id/produce',
  requireExecutionPermission,
  jobOrderController.recordProduction,
);

module.exports = router;
