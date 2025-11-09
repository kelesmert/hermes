const mongoose = require('mongoose');

// Permission dokümanı, sistem genelinde kullanılacak eylemleri/izinleri temsil eder.
const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Permission', permissionSchema);
