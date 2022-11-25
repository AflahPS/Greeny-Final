/* eslint-disable camelcase */
const moment = require('moment');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/order');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const Cart = require('../models/cart');
const Category = require('../models/category');
const cartController = require('./cartController');

let message = null;

////////////////////////////////////////////////////////////////////////////
exports.renderCheckout = catchAsync.user(async (req, res, next) => {
  const states = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttarakhand',
    'Uttar Pradesh',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli',
    'Daman and Diu',
    'Delhi',
    'Lakshadweep',
    'Puducherry',
  ];
  const { cart } = req.session;
  const coupon = cart.couponUsed;

  const totalNoDiscount = cart.products.reduce(
    (acc, cur) => acc + cur.product.price * cur.quantity,
    0
  );

  const cartActualDiscount = cart.products.reduce(
    (acc, cur) =>
      acc + (cur.quantity * cur.product.price * cur.product.discount) / 100,
    0
  );
  let couponDiscount;

  if (coupon && coupon.couponType === 'flat') {
    couponDiscount = coupon.discount;
  } else if (coupon && coupon.couponType === 'percentage') {
    couponDiscount = (totalNoDiscount * coupon.discount) / 100;
  }

  cart.couponUsed = coupon ? coupon._id : null;
  cart.couponDiscount = couponDiscount || 0;
  cart.discount = cartActualDiscount;
  cart.totalAmount = totalNoDiscount;
  await cart.save();

  cart.couponUsed = coupon || null;

  res.locals.cart = cart;
  res.locals.states = states;
  res.locals.categories = await Category.find();
  res.locals.user = req.session.user
    ? await User.findById(req.session.user._id)
    : null;
  res.render('user/checkout');
});

////////////////////////////////////////////////////////////////////////////
exports.proceedPayment = catchAsync.user(async (req, res, next) => {
  // Gathering data to create new order and payment
  const user = await User.findById(req.session.user._id);
  const { cartId, addressIndex, payMode } = req.body;
  const cart = await Cart.findById(cartId)
    .populate('products.product')
    .populate('couponUsed');

  if (cart && cart.products && cart.products.length > 0) {
    const stockOutProducts = cart.products.filter(
      (obj) => obj.quantity > obj.product.stock
    );
    if (stockOutProducts.length > 0) {
      return res.json({
        status: 'failed',
        message: `Sorry, ${stockOutProducts[0].product.name} has been sold out !!`,
      });
    }
  }

  const address = user.address[addressIndex];
  const thisDay = new Date(); // To calculate delivery dates
  const defaultDeliveryCharge = 10; // Change deliv charges according to distance
  const defaultDeliveryDelay = 3; // Change deliv Delay according to distance
  // Creating initial order, to place/save-to-DB if the payment is verified
  const orderToPlace = {
    oid: cartId.toString(),
    user: user._id,
    address,
    paymentMode: payMode,
    products: cart.products,
    subTotal: cart.totalAmount,
    discount: cart.discount,
    couponUsed: cart.couponUsed,
    couponDiscount: cart.couponDiscount,
    deliveryCharge: defaultDeliveryCharge,
    totalAmount:
      cart.totalAmount -
      cart.discount -
      cart.couponDiscount +
      defaultDeliveryCharge,
    deliveryExpected: thisDay.setDate(thisDay.getDate() + defaultDeliveryDelay), // deliv-date: after 3 days
  };
  req.session.orderToPlace = orderToPlace; // Saved to session, to access the order at verifyPayment function
  req.session.cartId = cart._id;

  // COD Payment Method
  if (payMode === 'pay-cod') {
    await Order.create(orderToPlace); // Placing the order
    const newOrder = await Order.findOne({ oid: orderToPlace.oid });
    if (Object.keys(newOrder).length) {
      req.session.orderToPlace = null; // Clearing the order from session
      user.orders.unshift(newOrder._id); // save the orderId on user.orders[]
      await user.save();
      await cartController.cartClear(cart._id); // To decrese stock of the product
      req.session.cart = null;

      return res.json({
        status: 'success',
        data: newOrder,
      });
    }
    return res.json({
      status: 'failed',
      message:
        'Could not place the order due to some technical errors, please try again later !',
    });
  }
  // Online Payment Method
  if (payMode === 'pay-online') {
    // Creating an instance of Razorpay to create order
    const instance = new Razorpay({
      key_id: process.env.RAZ_KEY_ID_DEV,
      key_secret: process.env.RAZ_KEY_SECRET_DEV,
    });
    // Details to create order from Razorpay server
    const options = {
      amount: orderToPlace.totalAmount * 100,
      currency: 'INR',
      receipt: orderToPlace.oid,
    };

    const orderFromRazorpay = await instance.orders.create(options);

    return res.json({
      status: 'success',
      order: orderFromRazorpay,
      user,
    });
  }
});

////////////////////////////////////////////////////////////////////////////
exports.verifyPayment = catchAsync.user(async (req, res) => {
  // Gathering data to verify payment
  const secret = process.env.RAZ_KEY_SECRET_DEV;
  const { signature, order_id, payment_id } = req.body;
  const body = `${order_id}|${payment_id}`.toString(); // body as specified in RZPay docs

  // creating expected signature to verify against
  // recieved signature with the secret key we have
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature === signature) {
    const orderToPlace = { ...req.session.orderToPlace };
    orderToPlace.oid = order_id;
    orderToPlace.paymentDetails = { order_id, payment_id }; /// Store a better payment details
    await Order.create(orderToPlace);
    await cartController.cartClear(req.session.cartId);
    req.session.orderToPlace = null;
    req.session.cartId = null;
    res.json({
      status: 'success',
      orderToPlace,
    });
  } else {
    res.json({
      status: 'failed',
      message: 'Could not verify payment',
    });
  }
});

////////////////////////////////////////////////////////////////////////////
exports.renderInvoice = catchAsync.user(async (req, res, next) => {
  const user = await User.findById(req.session.user._id);
  // Bad method, need to perfect array.unshift on proceedPayment method
  const order = await Order.findOne({ user: user._id })
    .sort('-createdAt')
    .limit(1)
    .populate('products.product')
    .populate('couponUsed');
  res.locals.order = order;
  res.locals.categories = await Category.find();
  res.locals.user = user || null;
  res.locals.moment = moment || null;
  res.render('user/invoice');
});

////////////////////////////////////////////////////////////////////////////
exports.renderOrderListUser = catchAsync.user(async (req, res, next) => {
  res.locals.categories = await Category.find();
  res.locals.user = req.session.user
    ? await User.findById(req.session.user._id)
    : null;
  res.locals.orders = await Order.find({ user: req.session.user._id })
    .sort('-createdAt')
    .populate('products.product');
  res.locals.moment = moment || null;
  res.render('user/orderlist');
});

//////////////////////////////////////////////////////////////////////////////

exports.renderOrderListAdmin = catchAsync.admin(async (req, res) => {
  // Fetching Users data from DB
  const orders = await Order.find().sort('-createdAt').populate('user');

  // Passing messages from other CRUD Ops
  res.locals.message = message;

  res.render('admin/order-list', {
    orders,
    moment,
  });
});

//////////////////////////////////////////////////////////////////////////////

exports.renderOrderSingle = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the user');
  }

  // fetching the order from database
  const order = await Order.findById(id)
    .populate('user')
    .populate('products.product')
    .populate('couponUsed');
  if (!Object.keys(order).length) {
    throw new Error('Order not found');
  }
  res.render('admin/order-single', { order, moment });
});

//////////////////////////////////////////////////////////////////////////////

exports.cancelOrderAdmin = catchAsync.other(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the user');
  }

  // fetching the order from database
  const order = await Order.findById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  order.status = 'cancelled';
  await order.save();
  message = `Order (Order Id: ${order.oid}) cancelled`;
  res.json({
    status: 'success',
    message,
  });
});
//////////////////////////////////////////////////////////////////////////////

exports.cancelOrderUser = catchAsync.user(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the user');
  }

  // fetching the order from database
  const order = await Order.findById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  order.status = 'cancelled';
  await order.save();
  res.redirect('/orders');
});

//////////////////////////////////////////////////////////////////////////////
exports.changeOrderStatus = catchAsync.other(async (req, res, next) => {
  // Validation
  const { status, oid } = req.body;
  if (
    !status ||
    !oid ||
    ![
      'confirmed',
      'processing',
      'dispatched',
      'out-for-delivery',
      'delivered',
      'cancelled',
    ].includes(status)
  ) {
    return res.json({
      status: 'failed',
      message: 'Could not find order status !',
    });
  }

  // fetching the order from database
  const order = await Order.findById(oid);
  if (!order) {
    return res.json({
      status: 'failed',
      message: 'Wrong order ID !',
    });
  }

  order.status = status;
  await order.save();
  return res.json({
    status: 'success',
    message: 'Status updated !!',
  });
});
