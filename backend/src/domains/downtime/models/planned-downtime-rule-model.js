const mongoose = require('mongoose');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const PLANNED_DOWNTIME_RULE_TYPES = ['recurring_daily', 'one_time'];

const plannedDowntimeRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    machineIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true,
      },
    ],
    reasonCode: {
      type: String,
      required: true,
      trim: true,
    },
    reasonCategory: {
      type: String,
      enum: ['planned'],
      default: 'planned',
      required: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    timezone: {
      type: String,
      default: 'Europe/Istanbul',
      trim: true,
    },
    type: {
      type: String,
      enum: PLANNED_DOWNTIME_RULE_TYPES,
      required: true,
    },
    recurrence: {
      startTime: { type: String, trim: true },
      endTime: { type: String, trim: true },
      daysOfWeek: { type: [Number], default: undefined },
    },
    startAt: Date,
    endAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

plannedDowntimeRuleSchema.index({ isActive: 1 });
plannedDowntimeRuleSchema.index({ type: 1, isActive: 1 });
plannedDowntimeRuleSchema.index({ machineIds: 1, isActive: 1 });

applyDefaultToJSON(plannedDowntimeRuleSchema);

module.exports = mongoose.model('PlannedDowntimeRule', plannedDowntimeRuleSchema);

