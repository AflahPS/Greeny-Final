const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const multer = require('multer');
const moment = require('moment');
const User = require('../models/user');
const Cart = require('../models/cart');
const catchAsync = require('../utils/catchAsync');

let message = null;

// Render Functions
////////////////////////////////////////////////////////////////////////
exports.renderUserSingle = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the user');
  }

  // fetching the user from database
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  const wishlist = await Cart.findOne({ user: user._id, cartType: 'wishlist' });
  let wishlistCount;
  if (wishlist && wishlist.products) {
    wishlistCount = wishlist.products.length || null;
  }
  res.locals.wishlistCount = wishlistCount;
  res.render('admin/user-single', { user, moment });
});

////////////////////////////////////////////////////////////////////////
exports.renderUserList = catchAsync.admin(async (req, res, next) => {
  // For pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  // Fetching Users data from DB
  const users = await User.find()
    .sort('-createdAt')
    .select('-__v')
    .select('role')
    .skip(skip)
    .limit(limit);

  // Passing messages from other CRUD Ops
  res.locals.message = message;

  res.render('admin/user-list', {
    users,
    moment,
  });
});

// CRUD Ops
////////////////////////////////////////////////////////////////////////
exports.addUser = catchAsync.admin(async (req, res, next) => {
  const data = { ...req.body };
  // Validation
  if (!data.name || !data.password || !data.age || !data.email) {
    message = 'Failed to create user - Not found valid data on fields !';
    return res.redirect('/admin/user-list');
  }

  // Check if email already exists
  const user = await User.find({ email: data.email });
  if (user.length > 0) {
    message = 'Failed to create user - Email already exists !';
    return res.redirect('/admin/user-list');
  }

  // data refinement
  data.age = parseInt(data.age, 10);
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(data.password, salt);
  data.password = hashPassword;

  // Create user
  await User.create(data);
  message = 'User created successfully !';
  res.redirect('/admin/user-list');
});

////////////////////////////////////////////////////////////////////////
exports.deleteUser = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the user');
  }

  // Deletion
  await User.findOneAndDelete(id);
  message = 'Successfully deleted the user !';
  res.redirect('/admin/user-list');
});

////////////////////////////////////////////////////////////////////////
exports.banUser = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the user');
  }

  // User data updation
  const user = await User.findById(id);
  user.isBanned = !user.isBanned;
  await user.save();
  message = user.isBanned
    ? 'Successfully banned the user !'
    : 'Successfully removed ban !';
  res.redirect('/admin/user-list');
});

//////////////////////////////////////////////////////////////////////////////
exports.addAddressProfile = catchAsync.user(async (req, res, next) => {
  const data = { ...req.body };
  const user = await User.findById(req.session.user._id);
  user.address.push(data);
  await user.save();

  res.redirect('/profile');
});

//////////////////////////////////////////////////////////////////////////////
exports.addAddressCheckout = catchAsync.user(async (req, res, next) => {
  const data = { ...req.body };
  const user = await User.findById(req.session.user._id);
  user.address.push(data);
  await user.save();

  res.redirect('/checkout');
});

//////////////////////////////////////////////////////////////////////////////
exports.addPaymentProfile = catchAsync.user(async (req, res, next) => {
  const data = { ...req.body };
  const user = await User.findById(req.session.user._id);
  user.payment.push(data);
  await User.findByIdAndUpdate(user._id, user);

  res.redirect('/profile');
});

//////////////////////////////////////////////////////////////////////////////
exports.addPaymentCheckout = catchAsync.user(async (req, res, next) => {
  const data = { ...req.body };
  const user = await User.findById(req.session.user._id);
  user.payment.push(data);
  await User.findByIdAndUpdate(user._id, user);

  res.redirect('/checkout');
});

//////////////////////////////////////////////////////////////////////////////
exports.editProfile = catchAsync.user(async (req, res, next) => {
  const data = { ...req.body };
  if (req.file) {
    data.image = req.file.filename;
  }
  data.age = parseInt(data.age, 10);
  await User.findByIdAndUpdate(req.session.user._id, data);
  req.session.user = await User.findById(req.session.user._id);

  res.redirect('/profile');
});

//////////////////////////////////////////////////////////////////////////////
exports.editAddressProfile = catchAsync.user(async (req, res, next) => {
  const data = { ...req.body };
  const { index } = req.query;
  const user = await User.findById(req.session.user._id);
  user.address[index] = data;
  await user.save();
  req.session.user = await User.findById(user._id);

  res.redirect('/profile');
});

//////////////////////////////////////////////////////////////////////////////
exports.editAddressCheckout = catchAsync.user(async (req, res, next) => {
  const data = { ...req.body };
  const { index } = req.query;
  const user = await User.findById(req.session.user._id);
  user.address[index] = data;
  await user.save();
  req.session.user = await User.findById(user._id);

  res.redirect('/checkout');
});

//////////////////////////////////////////////////////////////////////////////
exports.removeAddressProfile = catchAsync.user(async (req, res, next) => {
  const { index } = req.body;
  const user = await User.findById(req.session.user._id);
  console.log(user.address);
  user.address.splice(index, 1);
  await User.findByIdAndUpdate(user._id, user);

  req.session.user = await User.findById(user._id);
});

//////////////////////////////////////////////////////////////////////////////
exports.removePaymentProfile = catchAsync.user(async (req, res, next) => {
  const { index } = req.body;
  const user = await User.findById(req.session.user._id);
  user.payment.splice(index, 1);
  await User.findByIdAndUpdate(user._id, user);

  req.session.user = await User.findById(user._id);
});

//////////////////////////////////////////////////////////////////////////////
exports.removeAddressCheckout = catchAsync.user(async (req, res, next) => {
  const { index } = req.body;
  const user = await User.findById(req.session.user._id);
  user.address.splice(index, 1);
  await User.findByIdAndUpdate(user._id, user);

  req.session.user = await User.findById(user._id);
});

//////////////////////////////////////////////////////////////////////////////
exports.removePaymentCheckout = catchAsync.user(async (req, res, next) => {
  const { index } = req.body;
  const user = await User.findById(req.session.user._id);
  user.payment.splice(index, 1);
  await User.findByIdAndUpdate(user._id, user);

  req.session.user = await User.findById(user._id);
});

//////////////////////////////////////////////////////////////////////////
exports.userPopulator = catchAsync.user(async (req, res, next) => {
  if (req.session && req.session.user) {
    const user = { ...req.session.user };

    const cart = await Cart.findOne({
      user: user._id,
      cartType: 'cart',
    })
      .populate('products.product')
      .populate('couponUsed');

    const wishlist = await Cart.findOne({
      user: user._id,
      cartType: 'wishlist',
    }).populate('products.product');

    if (cart) {
      req.session.cart = cart;
      res.locals.cart = cart;
    } else {
      res.locals.cart = null;
    }

    if (
      wishlist
      // && wishlist.products.length &&
      // wishlist.products[0].product.name
    ) {
      res.locals.wishlist = wishlist;
    } else {
      res.locals.wishlist = null;
    }

    req.session.user = user;
    return next();
  }
  req.session.user = null;
  next();
});

////////////////////////////////////////////////////////////////////////////
exports.adminPopulator = catchAsync.user(async (req, res, next) => {
  res.locals.user = await User.findById(req.session.user._id);
  next();
});

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

exports.uploadProfilePic = upload.single('image');

////////////////////////////////////////////////////////////////////////////
exports.resizeProfilePic = (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  req.file.filename = `${req.session.user.name}-${
    req.session.user._id
  }-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/users/${req.file.filename}`);

  next();
};
