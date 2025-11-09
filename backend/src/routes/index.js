const { Router } = require('express');
const healthRoutes = require('./health-routes');
const authRoutes = require('../domains/auth/routes/auth-routes');
const usersRoutes = require('../domains/users/routes/users-routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

module.exports = router;
