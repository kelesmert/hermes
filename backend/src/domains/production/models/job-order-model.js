const mongoose = require('mongoose');
const jobOrderStatuses = require('../../../constants/job-order-statuses');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const JOB_ORDER_STATUS_VALUES = Object.values(jobOrderStatuses);

const jobOrderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    part: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Part',
      required: true,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    targetQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    producedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    goodQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    defectiveQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: JOB_ORDER_STATUS_VALUES,
      default: jobOrderStatuses.PENDING,
    },
    assignedOperator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startTime: Date,
    endTime: Date,
    estimatedDurationMinutes: Number,
    actualDurationMinutes: Number,
    notes: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    lastPauseTime: Date,
  },
  {
    timestamps: true,
  },
);

jobOrderSchema.index({ machine: 1, status: 1 });
jobOrderSchema.index({ part: 1, status: 1 });
jobOrderSchema.index({ orderNo: 1 });

applyDefaultToJSON(jobOrderSchema);

module.exports = mongoose.model('JobOrder', jobOrderSchema);
