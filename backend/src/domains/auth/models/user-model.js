const mongoose = require('mongoose');
const { comparePassword } = require('../../../utils/password');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.path('roles').validate(
  (rolesArr) => Array.isArray(rolesArr) && rolesArr.length > 0,
  'Kullanıcının en az bir rolü olmalıdır.',
);

userSchema.methods.comparePassword = function comparePasswordHook(plainPassword) {
  return comparePassword(plainPassword, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject({ getters: true });
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
