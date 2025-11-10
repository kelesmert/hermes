const asyncHandler = require('../../../utils/async-handler');
const Permission = require('../../auth/models/permission-model');

const listPermissions = asyncHandler(async (_req, res) => {
  const permissions = await Permission.find().sort({ category: 1, name: 1 });

  res.json({
    permissions: permissions.map((permission) => ({
      id: permission._id,
      name: permission.name,
      label: permission.label,
      description: permission.description,
      category: permission.category,
    })),
  });
});

module.exports = {
  listPermissions,
};
