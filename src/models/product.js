const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product must have a name !'],
      minLen: [2, 'Product must have at least 2 letters !'],
      maxLen: [64, 'Product name cannot exceed 64 letters !'],
    },
    brand: { type: String, default: 'greeny' },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must have a category or create a new one!'],
    },
    description: {
      type: String,
      required: [true, 'Product must have a description!'],
      minLen: [15, 'Product description must have minimum 15 characters'],
    },
    stock: {
      type: Number,
      required: [true, 'Product stock must be provided!'],
    },
    price: {
      type: Number,
      required: [true, 'Product price must be provided!'],
    },
    unitIn: {
      type: String,
      required: [true, 'Product unit must be provided! eg:kilograms'],
      enum: ['kilogram', 'litre', 'piece', 'bundle'],
    },
    discount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      required: [true, 'Product must have at least one tag!'],
    },
    images: {
      type: [String],
      default: '01.jpg',
    },
    thumbnail: {
      type: String,
      default: '01.jpg',
    },
    ratingsTotal: {
      type: Number,
    },
    ratingsAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 3,
    },
    expiresIn: {
      type: Date,
      validate: {
        validator: function (val) {
          return new Date(val) >= Date.now();
        },
        message: 'The given date ({VALUE}) is already over !',
      },
    },
    isActiveToggledAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('isExpired').get(function () {
  return new Date(this.expiresIn) <= Date.now();
});

module.exports = mongoose.model('Product', productSchema);
