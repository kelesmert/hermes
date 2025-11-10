const { Router } = require('express');
const healthRoutes = require('./health-routes');
const authRoutes = require('../domains/auth/routes/auth-routes');
const usersRoutes = require('../domains/users/routes/users-routes');
const rolesRoutes = require('../domains/access-control/routes/roles-routes');
const permissionsRoutes = require('../domains/access-control/routes/permissions-routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);

module.exports = router;
