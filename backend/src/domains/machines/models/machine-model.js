const mongoose = require('mongoose');
const machineStatuses = require('../../../constants/machine-statuses');

const MACHINE_STATUS_VALUES = Object.values(machineStatuses);

const machineSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: MACHINE_STATUS_VALUES,
      default: machineStatuses.UNKNOWN,
    },
    lastEventAt: Date,
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Machine', machineSchema);
