const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');
const Coupon = require('../models/coupon');
const Cart = require('../models/cart');
const catchAsync = require('../utils/catchAsync');

let message = null;

////////////////////////////////////////////////////////////////////////////
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('File is not an image'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadCouponThumb = upload.single('thumbnail');

////////////////////////////////////////////////////////////////////////////
exports.resizeCouponThumb = (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  req.file.filename = `${req.body.name}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 300)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/coupon/${req.file.filename}`);

  next();
};

// Render
////////////////////////////////////////////////////////////////////////////
exports.renderCouponList = catchAsync.admin(async (req, res, next) => {
  const coupons = await Coupon.find().sort('-createdAt').select('-__v');
  // .skip(skip)
  // .limit(limit);

  res.locals.message = message;
  res.render('admin/coupon-list', {
    coupons,
    moment,
  });
});

////////////////////////////////////////////////////////////////////////////
exports.renderCouponUpdate = catchAsync.admin(async (req, res, next) => {
  const { id } = req.query;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new Error('coupon not found');
  }
  res.render('admin/coupon-update', { coupon });
});

////////////////////////////////////////////////////////////////////////////
exports.renderAddCoupon = catchAsync.admin(async (req, res, next) => {
  res.render('admin/coupon-add');
});

// CRUD Ops
////////////////////////////////////////////////////////////////////////////
exports.addCoupon = catchAsync.admin(async (req, res, next) => {
  const data = { ...req.body };

  // Validation
  if (
    !data.name ||
    !data.couponType ||
    !['percentage', 'flat'].includes(data.couponType) ||
    !data.discount ||
    !data.startDate ||
    !data.endDate ||
    !data.couponCode ||
    !data.description
  ) {
    message = 'Not found valid data on fields while creating Coupon !';
    res.redirect('/admin/coupon-list');
  }
  if (
    (data.couponType === 'percentage' && parseFloat(data.couponType) > 90) ||
    parseFloat(data.couponType) <= 0
  ) {
    message = 'Not found valid data on fields while creating Coupon !';
    res.redirect('/admin/coupon-list');
  }

  const coupon = await Coupon.find({ couponCode: data.couponCode });

  // Coupon already exists
  if (coupon.length > 0) {
    message = 'Coupon already exists';
    res.redirect('/admin/coupon-list');
  }

  // data refinement
  if (req.file) {
    data.thumbnail = req.file.filename;
  } else {
    delete data.thumbnail;
  }
  data.lastUpdatedBy = req.session.user._id;
  data.discount = parseInt(data.discount, 10);
  data.couponCode = data.couponCode.toUpperCase();

  // Create coupon
  await Coupon.create(data);
  message = 'coupon created successfully !';
  res.redirect('/admin/coupon-list');
});

////////////////////////////////////////////////////////////////////////////
exports.editCoupon = catchAsync.admin(async (req, res, next) => {
  const { id } = req.query;
  const data = { ...req.body };
  // Validation
  if (!id) {
    throw new Error('Invalid id provided for the coupon');
  }

  if (
    !data.name ||
    !data.couponType ||
    !['percentage', 'flat'].includes(data.couponType) ||
    !data.discount ||
    !data.startDate ||
    !data.endDate ||
    !data.couponCode ||
    !data.description
  ) {
    message = 'Not found valid data on fields while creating Coupon !';
    res.redirect('/admin/coupon-list');
  }
  if (
    (data.couponType === 'percentage' && parseFloat(data.couponType) > 90) ||
    parseFloat(data.couponType) <= 0
  ) {
    message = 'Not found valid data on fields while creating Coupon !';
    res.redirect('/admin/coupon-list');
  }

  // data refinement
  if (req.file) {
    data.thumbnail = req.file.filename;
  } else {
    delete data.thumbnail;
  }
  data.lastUpdatedBy = req.session.user._id;
  data.discount = parseFloat(data.discount);
  data.couponCode = data.couponCode.toUpperCase();

  // Update coupon

  const newCoupon = await Coupon.findByIdAndUpdate(id, data, {
    runValidators: true,
  });

  if (!newCoupon) {
    message = 'Not found the Coupon !';
    return res.redirect('/admin/coupon-list');
  }

  message = 'coupon Edited successfully !';
  res.redirect('/admin/coupon-list');
});

////////////////////////////////////////////////////////////////////////////
exports.deleteCoupon = catchAsync.admin(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the coupon');
  }
  await Coupon.findByIdAndDelete(id);
  message = 'Successfully deleted the coupon !';
  res.redirect('/admin/coupon-list');
});

////////////////////////////////////////////////////////////////////////////
exports.banCoupon = catchAsync.admin(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the coupon');
  }
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    message = 'Coupon not found in database !';
    res.redirect('/admin/coupon-list');
  }
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  message = coupon.isActive
    ? 'Successfully activated the coupon'
    : 'Successfully deActivated the coupon';
  res.redirect('/admin/coupon-list');
});

////////////////////////////////////////////////////////////////////////////
exports.verifyCoupon = catchAsync.other(async (req, res, next) => {
  const { action } = req.body;
  const cart = await Cart.findById(req.session.cart).populate(
    'products.product'
  );
  let coupon;

  if (req.body.couponCode) {
    const { couponCode } = req.body;
    coupon = await Coupon.findOne({ couponCode });
  } else if (req.body.couponId) {
    const { couponId } = req.body;
    coupon = await Coupon.findById(couponId);
  } else if (cart.couponUsed) {
    coupon = await Coupon.findById(cart.couponUsed);
  }

  if (!coupon) {
    return res.json({
      status: 'failed',
      message: 'Cannot find coupon!',
    });
  }

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
  if (coupon.couponType === 'flat') {
    couponDiscount = coupon.discount;
  } else if (coupon.couponType === 'percentage') {
    couponDiscount = (totalNoDiscount * coupon.discount) / 100;
  }

  if (action === 'apply') {
    cart.couponUsed = coupon._id;
    cart.discount = cartActualDiscount;
    cart.totalAmount = totalNoDiscount;
    cart.couponDiscount = couponDiscount;
    await cart.save();
    return res.json({
      status: 'success',
      cart,
    });
  }
  if (action === 'remove') {
    cart.couponUsed = null;
    cart.discount = cartActualDiscount;
    cart.totalAmount = totalNoDiscount;
    cart.couponDiscount = 0;
    await cart.save();
    return res.json({
      status: 'success',
      cart,
    });
  }
  return res.json({
    status: 'failed',
    message: 'failed to apply coupon discount !',
  });
});
