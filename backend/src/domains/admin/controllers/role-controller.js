const asyncHandler = require('../../../utils/async-handler');
const roleService = require('../services/role-service');

const listRoles = asyncHandler(async (_req, res) => {
  const roles = await roleService.listRoles();
  res.json({ roles });
});

const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body || {});
  res.status(201).json({ role });
});

const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await roleService.updateRole(id, req.body || {});
  res.json({ role });
});

const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await roleService.deleteRole(id);
  res.json(result);
});

module.exports = {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
};
