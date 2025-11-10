const { Router } = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requirePermissions } = require('../../../middleware/permission-guard');
const permissions = require('../../../constants/permissions');
const usersController = require('../controllers/users-controller');

const router = Router();

router.use(authGuard);
router.get('/', requirePermissions(permissions.USERS_MANAGE), usersController.listUsers);
router.post('/', requirePermissions(permissions.USERS_MANAGE), usersController.createUser);
router.patch('/:id', requirePermissions(permissions.USERS_MANAGE), usersController.updateUser);
router.delete('/:id', requirePermissions(permissions.USERS_MANAGE), usersController.deleteUser);

module.exports = router;
