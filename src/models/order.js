const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    oid: {
      type: String,
      required: [true, 'Order should have a unique ID'],
      unique: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order should have a unique user-ID'],
    },
    deliveryExpected: {
      type: Date,
      //TODO:
      //default: orderedAt.setDate(orderedAt.getDate() + 10),
    },
    deliveredAt: {
      type: Date,
    },
    paymentMode: {
      type: String,
      enum: ['pay-cod', 'pay-online'],
      required: [true, 'Payment-mode not specified'],
    },
    paymentDetails: {},
    status: {
      type: String,
      required: [true, 'Provide current state of the order !'],
      enum: [
        'confirmed',
        'processing',
        'dispatched',
        'out-for-delivery',
        'delivered',
        'cancelled',
      ],
      default: 'confirmed',
    },
    address: {
      title: { type: String, required: [true, 'Order needs an address'] },
      content: { type: String, required: [true, 'Order needs an address'] },
      state: { type: String, required: [true, 'Order needs an address'] },
      phone: { type: String, required: [true, 'Order needs an address'] },
    },
    couponUsed: {
      type: mongoose.Types.ObjectId,
      ref: 'Coupon',
    },
    products: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    subTotal: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    deliveryCharge: {
      type: Number,
      default: 10,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// orderSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//     select: 'uid name email address contactNumber image',
//   });
//   // Do something about multiple populate later
//   this.populate('couponUsed');
//   this.populate('address');
//   this.populate('cart');

//   next();
// });

module.exports = mongoose.model('Order', orderSchema);
