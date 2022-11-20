const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category should have a name'],
      unique: [true, 'Category should have a unique name'],
    },
    thumbnail: {
      type: String,
      default: 'dairy.jpg',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    lastUpdatedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    isActiveToggledAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', categorySchema);
