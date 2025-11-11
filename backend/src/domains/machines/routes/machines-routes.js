const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requirePermissions, requireAnyPermission } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const machineController = require('../controllers/machine-controller');
const machineEventController = require('../controllers/machine-event-controller');

const router = Router();

router.use(authGuard);

router.get('/', requireAnyPermission(permissions.MACHINES_READ, permissions.MACHINES_WRITE), machineController.listMachines);
router.post('/', requirePermissions(permissions.MACHINES_WRITE), machineController.createMachine);
router.get('/:id', requireAnyPermission(permissions.MACHINES_READ, permissions.MACHINES_WRITE), machineController.getMachine);
router.patch('/:id', requirePermissions(permissions.MACHINES_WRITE), machineController.updateMachine);
router.delete('/:id', requirePermissions(permissions.MACHINES_WRITE), machineController.deleteMachine);

router.get(
  '/:id/events',
  requireAnyPermission(permissions.MACHINES_READ, permissions.MACHINES_WRITE),
  machineEventController.listMachineEvents,
);
router.post(
  '/:id/events',
  requirePermissions(permissions.MACHINES_WRITE),
  machineEventController.createMachineEvent,
);

module.exports = router;
