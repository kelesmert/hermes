const User = require('../models/user-model');
const asyncHandler = require('../utils/async-handler');

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .select('firstName lastName email roles isActive createdAt')
    .populate('roles', 'name label');

  res.json({
    users: users.map((user) => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: (user.roles || []).map((role) => ({
        id: role._id,
        name: role.name,
        label: role.label,
      })),
      isActive: user.isActive,
      createdAt: user.createdAt,
    })),
  });
});

module.exports = {
  listUsers,
};
