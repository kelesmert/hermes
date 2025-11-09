const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    userAgent: String,
    ipAddress: String,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: Date,
    replacedByToken: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

refreshTokenSchema.methods.isActive = function isActive() {
  if (this.revokedAt) return false;
  return this.expiresAt.getTime() > Date.now();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
