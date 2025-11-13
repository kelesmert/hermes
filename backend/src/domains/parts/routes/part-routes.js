const express = require('express');
const authGuard = require('../../../middleware/auth-guard');
const { requirePermissions } = require('../../../middleware/permission-guard');
const partController = require('../controllers/part-controller');

const router = express.Router();

router.use(authGuard);

router
  .route('/')
  .get(requirePermissions('parts.read'), partController.listParts)
  .post(requirePermissions('parts.manage'), partController.createPart);

router
  .route('/:id')
  .get(requirePermissions('parts.read'), partController.getPart)
  .patch(requirePermissions('parts.manage'), partController.updatePart)
  .delete(requirePermissions('parts.manage'), partController.deletePart);

module.exports = router;
