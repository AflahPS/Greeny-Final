const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'User details are required'],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product details are required'],
    },
    content: {
      type: String,
      // required: [true, 'Review without content!!'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
    },
    // isEdited: {
    //   type: Boolean,
    //   default: false,
    // },
    // isCertified: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
