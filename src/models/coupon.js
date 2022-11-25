const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Provide coupon name'],
    },
    couponType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: [true, 'Provide coupon type !'],
    },
    discount: {
      type: Number,
      required: [true, 'Provide coupon discount'],
    },
    thumbnail: {
      type: String,
      default: '01.png',
    },
    couponCode: {
      type: String,
      required: [true, 'Provide coupon code'],
    },
    lastUpdatedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a valid start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an valid end date'],
      validate: {
        validator: function (val) {
          return new Date(val) > Date.now();
        },
        message: 'The given date ({VALUE}) is already over !',
      },
    },
    totalUsage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.post(/^find/, (docs, next) => {
  if (docs && docs.length) {
    docs.isActive = new Date(docs.endDate) > Date.now();
  }
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);
