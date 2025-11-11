const mongoose = require('mongoose');
const machineStatuses = require('../../../constants/machine-statuses');

const MACHINE_STATUS_VALUES = Object.values(machineStatuses);

const machineEventSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    state: {
      type: String,
      enum: MACHINE_STATUS_VALUES,
      required: true,
    },
    reasonCode: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: Date,
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    source: {
      type: String,
      enum: ['operator', 'system', 'simulator'],
      default: 'system',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

machineEventSchema.index({ machine: 1, startedAt: -1 });

module.exports = mongoose.model('MachineEvent', machineEventSchema);
