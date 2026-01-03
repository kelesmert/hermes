const mongoose = require('mongoose');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const aiUsageSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    useCase: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
    },
    downtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MachineEvent',
    },
    windowKey: {
      type: String,
      trim: true,
    },
    promptVersion: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    forceRefresh: {
      type: Boolean,
      default: false,
    },
    cacheHit: {
      type: Boolean,
      default: false,
    },
    insightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AiInsight',
    },
    latencyMs: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['success', 'error', 'blocked'],
      default: 'success',
    },
    errorType: {
      type: String,
      trim: true,
    },
    tokensIn: {
      type: Number,
      default: 0,
    },
    tokensOut: {
      type: Number,
      default: 0,
    },
    tokensTotal: {
      type: Number,
      default: 0,
    },
    estimatedCostUsd: {
      type: Number,
      default: 0,
    },
    rateLimitState: {
      type: mongoose.Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

aiUsageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
aiUsageSchema.index({ createdBy: 1, createdAt: -1 });

applyDefaultToJSON(aiUsageSchema);

module.exports = mongoose.model('AiUsage', aiUsageSchema);
