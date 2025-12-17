const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requirePermissions } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const simulationsController = require('../controllers/simulations-controller');

const router = Router();

router.use(authGuard);
router.use(requirePermissions(permissions.PRODUCTION_MANAGE));

router.get('/', simulationsController.listSimulations);
router.post('/:name/start', simulationsController.startSimulation);
router.post('/:name/stop', simulationsController.stopSimulation);
router.get('/:name/logs', simulationsController.getLogs);
router.post('/:name/logs/clear', simulationsController.clearLogs);

module.exports = router;

