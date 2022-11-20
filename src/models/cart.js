const mongoose = require('mongoose');
// const Coupon = require('./coupon');

const cartSchema = new mongoose.Schema(
  {
    cartType: {
      type: String,
      required: true,
      default: 'cart',
      enum: ['cart', 'wishlist'],
    },
    couponUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must have user details in it'],
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
    discount: {
      type: Number,
      default: 0,
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

// cartSchema.post(/^find/, async (docs, next) => {
//   if (!docs) return next();
//   if (docs.cartType !== 'cart') return next();

//   if (
//     docs.products &&
//     docs.products.length > 0 &&
//     docs.products[0].product.name
//   ) {
//     docs.discount = docs.products.reduce(
//       (acc, cur) =>
//         acc + (cur.quantity * cur.product.price * cur.product.discount) / 100,
//       0
//     );
//     docs.totalAmount = docs.products.reduce(
//       (acc, cur) => acc + cur.product.price * cur.quantity,
//       0
//     );

//     console.log(typeof docs.totalAmount);
//     console.log(typeof docs.discount);

//     if (docs.couponUsed) {
//       const coupon = await Coupon.findById(docs.couponUsed);
//       if (!coupon) return next();
//       if (
//         coupon.couponType === 'flat' &&
//         docs.totalAmount > 200 &&
//         docs.totalAmount > coupon.discount
//       ) {
//         docs.couponDiscount = coupon.discount;
//       } else if (coupon.couponType === 'percentage' && docs.totalAmount > 200) {
//         docs.couponDiscount = (coupon.discount * docs.totalAmount) / 100;
//       }
//     }
//   }
//   next();
// });

module.exports = mongoose.model('Cart', cartSchema);
