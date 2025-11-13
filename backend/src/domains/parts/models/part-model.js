const mongoose = require('mongoose');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const partSchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
    },
    idealCycleTime: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
      default: 'component',
    },
    unit: {
      type: String,
      trim: true,
      default: 'piece',
    },
    tags: {
      type: [String],
      default: [],
    },
    compatibleMachines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
      },
    ],
    // Opsiyonel: parça için makine bazında varsayılan parametreler (örn. spindle, feed rate).
    defaultMachineSettings: {
      type: {
        feedRate: Number,
        spindleSpeed: Number,
        coolant: String,
      },
      default: undefined,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

applyDefaultToJSON(partSchema);

module.exports = mongoose.model('Part', partSchema);
