const { Router } = require('express');
const healthRoutes = require('./health-routes');
const authRoutes = require('../domains/auth/routes/auth-routes');
const usersRoutes = require('../domains/users/routes/users-routes');
const rolesRoutes = require('../domains/access-control/routes/roles-routes');
const permissionsRoutes = require('../domains/access-control/routes/permissions-routes');
const machinesRoutes = require('../domains/machines/routes/machines-routes');
const boardRoutes = require('../domains/board/routes/board-routes');
const partsRoutes = require('../domains/parts/routes/part-routes');
const productionRoutes = require('../domains/production/routes/job-order-routes');
const oeeRoutes = require('../domains/oee/routes/oee-routes');
const downtimeRoutes = require('../domains/downtime/routes/downtime-routes');
const plannedDowntimeRuleRoutes = require('../domains/downtime/routes/planned-downtime-rule-routes');
const plannedDowntimeRunRoutes = require('../domains/downtime/routes/planned-downtime-run-routes');
const simulationsRoutes = require('../domains/simulations/routes/simulations-routes');
const aiRoutes = require('../domains/ai/routes/ai-routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/machines', machinesRoutes);
router.use('/board', boardRoutes);
router.use('/parts', partsRoutes);
router.use('/production', productionRoutes);
router.use('/oee', oeeRoutes);
router.use('/downtimes', downtimeRoutes);
router.use('/planned-downtime-rules', plannedDowntimeRuleRoutes);
router.use('/planned-downtime-runs', plannedDowntimeRunRoutes);
router.use('/simulations', simulationsRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
