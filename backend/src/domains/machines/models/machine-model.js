const mongoose = require('mongoose');
const machineStatuses = require('../../../constants/machine-statuses');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

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
    currentJobOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOrder',
      default: null,
    },
    responsibleUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

applyDefaultToJSON(machineSchema);

module.exports = mongoose.model('Machine', machineSchema);
