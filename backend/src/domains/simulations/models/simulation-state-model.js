const mongoose = require('mongoose');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const simulationStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    timezone: {
      type: String,
      required: true,
      trim: true,
    },
    epochDate: {
      type: String,
      required: true,
      trim: true,
    },
    shiftStart: {
      type: String,
      required: true,
      trim: true,
    },
    shiftEnd: {
      type: String,
      required: true,
      trim: true,
    },
    virtualDay: {
      type: String,
      required: true,
      trim: true,
    },
    shiftStartAt: {
      type: Date,
      required: true,
    },
    shiftEndAt: {
      type: Date,
      required: true,
    },
    cursorAt: Date,
    simulationRunId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['idle', 'running', 'paused', 'completed'],
      default: 'idle',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

applyDefaultToJSON(simulationStateSchema);

module.exports = mongoose.model('SimulationState', simulationStateSchema, 'simulation_states');

