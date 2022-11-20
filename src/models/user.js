const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      minLen: [2, 'User must have at least 2 letters !'],
      maxLen: [64, 'User name cannot exceed 64 letters !'],
    },
    email: {
      type: String,
      required: [true, 'User must have an email!'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'User has to provide password in order to login'],
    },
    age: {
      type: Number,
      default: 18,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    contactNumber: {
      type: String,
    },
    image: {
      type: String,
      default: 'user.png',
    },
    address: {
      type: [
        {
          title: String,
          content: String,
          phone: String,
          state: String,
          isPrimary: {
            type: Boolean,
            default: true,
          },
        },
      ],
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    cart: {
      type: mongoose.Types.ObjectId,
      ref: 'Cart',
    },
    wishlist: {
      type: mongoose.Types.ObjectId,
      ref: 'Cart',
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'super-user', 'admin', 'super-admin'],
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre(/^find/, function (next) {
//   this.populate('address');
//   next();
// });

module.exports = mongoose.model('User', userSchema);
