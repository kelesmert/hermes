const mongoose = require('mongoose');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const aiInsightSchema = new mongoose.Schema(
  {
    useCase: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
    },
    downtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MachineEvent',
    },
    source: {
      type: String,
      trim: true,
    },
    window: {
      mode: String,
      shiftDateYmd: String,
      fromMs: Number,
      toMs: Number,
      timezone: String,
    },
    windowKey: {
      type: String,
      required: true,
      trim: true,
    },
    dataSnapshotHash: {
      type: String,
      required: true,
      trim: true,
    },
    hashVersion: {
      type: Number,
      default: 1,
    },
    promptVersion: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      default: 'openai',
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    normalizedInput: {
      type: mongoose.Schema.Types.Mixed,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
    },
    tokenUsage: {
      type: mongoose.Schema.Types.Mixed,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
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

aiInsightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
aiInsightSchema.index({ createdBy: 1, generatedAt: -1 });
aiInsightSchema.index({
  createdBy: 1,
  useCase: 1,
  machineId: 1,
  source: 1,
  windowKey: 1,
  generatedAt: -1,
});
aiInsightSchema.index({ createdBy: 1, useCase: 1, dataSnapshotHash: 1, generatedAt: -1 });

applyDefaultToJSON(aiInsightSchema);

module.exports = mongoose.model('AiInsight', aiInsightSchema);
