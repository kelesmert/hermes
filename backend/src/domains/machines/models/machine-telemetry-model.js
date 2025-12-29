const mongoose = require('mongoose');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const telemetrySchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
      index: true,
    },
    jobOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOrder',
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    signalValue: {
      type: Number,
      enum: [0, 1],
      required: true,
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    intervalMs: Number,
    source: {
      type: String,
      default: 'simulator',
      trim: true,
    },
    simulationRunId: {
      type: String,
      trim: true,
      index: true,
    },
    processedAt: Date,
  },
  {
    timestamps: true,
  },
);

telemetrySchema.index({ machine: 1, timestamp: -1 });
telemetrySchema.index({ jobOrder: 1, timestamp: -1 });
telemetrySchema.index({ processedAt: 1, timestamp: 1 });
telemetrySchema.index({ source: 1, simulationRunId: 1, timestamp: 1 });

applyDefaultToJSON(telemetrySchema);

module.exports = mongoose.model('MachineTelemetry', telemetrySchema, 'machine_telemetry');
