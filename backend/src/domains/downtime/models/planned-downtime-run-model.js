const mongoose = require('mongoose');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const RUN_STATUSES = [
  'scheduled',
  'started',
  'ended',
  'skipped_no_active_job',
  'skipped_conflict',
];

const plannedDowntimeRunSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlannedDowntimeRule',
      required: true,
    },
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    scheduledStartAt: {
      type: Date,
      required: true,
    },
    scheduledEndAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: RUN_STATUSES,
      required: true,
    },
    machineEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MachineEvent',
    },
    jobOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOrder',
    },
    notes: {
      type: String,
      trim: true,
    },
    debug: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

plannedDowntimeRunSchema.index({ ruleId: 1, machineId: 1, scheduledStartAt: 1 }, { unique: true });
plannedDowntimeRunSchema.index({ machineId: 1, scheduledStartAt: -1 });
plannedDowntimeRunSchema.index({ status: 1, scheduledStartAt: -1 });

applyDefaultToJSON(plannedDowntimeRunSchema);

module.exports = mongoose.model('PlannedDowntimeRun', plannedDowntimeRunSchema);

