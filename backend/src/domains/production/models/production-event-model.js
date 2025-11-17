const mongoose = require('mongoose');
const productionEventTypes = require('../../../constants/production-event-types');
const defectTypes = require('../../../constants/defect-types');
const { applyDefaultToJSON } = require('../../../utils/to-json-transform');

const EVENT_TYPE_VALUES = Object.values(productionEventTypes);
const DEFECT_TYPE_VALUES = Object.values(defectTypes);

const productionEventSchema = new mongoose.Schema(
  {
    jobOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOrder',
      required: true,
    },
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    eventType: {
      type: String,
      enum: EVENT_TYPE_VALUES,
      required: true,
    },
    quantity: {
      type: Number,
      min: 0,
    },
    qualityStatus: {
      type: String,
      enum: ['good', 'defective'],
    },
    defectType: {
      type: String,
      enum: DEFECT_TYPE_VALUES,
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['operator', 'system', 'simulator'],
      default: 'operator',
    },
  },
  {
    timestamps: true,
  },
);

productionEventSchema.index({ jobOrder: 1, timestamp: -1 });
productionEventSchema.index({ machine: 1, timestamp: -1 });

applyDefaultToJSON(productionEventSchema);

module.exports = mongoose.model('ProductionEvent', productionEventSchema);
