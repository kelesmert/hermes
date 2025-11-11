const mongoose = require('mongoose');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const oeeMachineStateSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
      unique: true,
    },
    lastSignalValue: {
      type: Number,
      enum: [0, 1],
      default: null,
    },
    lastSignalAt: Date,
    zeroSequenceStart: Date,
    currentState: {
      type: String,
      enum: ['running', 'downtime', 'unknown'],
      default: 'unknown',
    },
    openEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MachineEvent',
    },
  },
  {
    timestamps: true,
  },
);

applyDefaultToJSON(oeeMachineStateSchema);

module.exports = mongoose.model('OeeMachineState', oeeMachineStateSchema, 'oee_machine_states');
