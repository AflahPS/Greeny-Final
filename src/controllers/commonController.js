const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const Category = require('../models/category');
const Product = require('../models/product');
const User = require('../models/user');
const Banner = require('../models/banner');
const Enquiry = require('../utils/enquire');

// const productController = require('./productController');
const review = require('../models/review');

//////////////////////////////////////////////////////////////////////////
function queryModifier(queryObj, prevQuery) {
  // price, category, sort, page, limit, ratingsAverage

  const newQuery = {};
  //If no query string or reser filter button clicked,
  if (!Object.keys(queryObj).length || queryObj.filter === 'clear') {
    return newQuery;
  }

  //1 Filter by price
  //1A. If the price-filter is specified in the query
  if (queryObj.price) {
    newQuery.price = queryObj.price;

    //1B. If the price-filter is not specified in the query but
    // price-filter is currently selected in the website and it already exists in session
  } else if (prevQuery && prevQuery.price && !queryObj.price) {
    newQuery.price = prevQuery.price;
  }
  //2 Filter by category
  //2A. If the category-filter is specified in the query
  if (queryObj.category) {
    newQuery.category = queryObj.category;

    //2B. If the category-filter is not specified in the query but
    // category-filter is currently selected in the website and it already exists in session
  } else if (prevQuery && prevQuery.category && !queryObj.category) {
    newQuery.category = prevQuery.category;
  }

  //3. Filter by ratings
  //3A. If the rating-filter is specified in the query
  if (queryObj.ratingsAverage) {
    newQuery.ratingsAverage = queryObj.ratingsAverage;

    //3B. If the rating-filter is not specified in the query but
    // rating-filter is currently selected in the website and it already exists in session
  } else if (
    prevQuery &&
    prevQuery.ratingsAverage &&
    !queryObj.ratingsAverage
  ) {
    newQuery.ratingsAverage = prevQuery.ratingsAverage;
  }

  //4. Sort products
  //4A. If the sort is specified in the query
  if (queryObj.sort) {
    newQuery.sort = queryObj.sort;

    //4B. If the sort is not specified in the query but
    // Sort is currently selected in the website and it already exists in session
  } else if (prevQuery && prevQuery.sort && !queryObj.sort) {
    newQuery.sort = prevQuery.sort;
  }

  //5. Limit products
  //5A. If the limit is specified in the query
  if (queryObj.limit) {
    newQuery.limit = queryObj.limit;

    //5B. If the limit is not specified in the query but
    // limit is currently selected in the website and it already exists in session
  } else if (prevQuery && prevQuery.limit && !queryObj.limit) {
    newQuery.limit = prevQuery.limit;
  }

  //6. Paginate products
  //6A. If the page is specified in the query
  if (queryObj.page) {
    newQuery.page = queryObj.page;

    //6B. If the page is not specified in the query but
    // page is currently selected in the website and it already exists in session
  } else if (prevQuery && prevQuery.page && !queryObj.page) {
    newQuery.page = prevQuery.page;
  }

  return newQuery;
}
//////////////////////////////////////////////////////////////////////////
exports.renderHome = catchAsync.user(async (req, res, next) => {
  const now = Date.now();
  //1) Recently Sold products limit: 10 ----Need to implement this later
  res.locals.recentSoldProducts = await Product.find({
    expiresIn: { $gt: now },
  }).limit(10);

  //2) Newly Added products limit:10
  res.locals.newlyAddedProducts = await Product.find({
    expiresIn: { $gt: now },
  })
    .sort('-createdAt')
    .limit(10);

  //3) Most sold products in a week limit:10 ----Need to implement this later
  res.locals.mostSoldProducts = await Product.find({
    expiresIn: { $gt: now },
  }).limit(10);

  //4) Most rated products limit:10
  res.locals.mostRatedProducts = await Product.find({
    expiresIn: { $gt: now },
  })
    .sort('-ratingsAverage')
    .limit(10);

  //5) Most discount products limit:10
  res.locals.mostDiscountProducts = await Product.find({
    expiresIn: { $gt: now },
  })
    .sort('-discount')
    .limit(10);

  res.locals.banners = (await Banner.find({ isActive: true })) || null;
  res.locals.categories = await Category.find();
  res.locals.user = req.session.user
    ? await User.findById(req.session.user._id)
    : null;
  res.render('user/home');
});

/////////////////////////////////////////////////////////////////////////////
exports.renderShop = catchAsync.user(async (req, res, next) => {
  const queryObj = { ...req.query };
  const { prevQuery } = req.session;
  const now = Date.now();
  // Modifying the query object
  const newQuery = queryModifier(queryObj, prevQuery);

  if (newQuery.price && Array.isArray(newQuery.price)) {
    const max = Math.max(
      parseInt(newQuery.price[0], 10),
      parseInt(newQuery.price[1], 10)
    );
    const min = Math.min(
      parseInt(newQuery.price[0], 10),
      parseInt(newQuery.price[1], 10)
    );
    newQuery.price = { $gte: min, $lte: max };
  }
  if (newQuery.category && Array.isArray(newQuery.category)) {
    newQuery.category = { $in: newQuery.category };
  }
  if (newQuery.ratingsAverage && Array.isArray(newQuery.ratingsAverage)) {
    newQuery.ratingsAverage = { $in: newQuery.ratingsAverage };
  }

  const finalQuery = new Enquiry(
    Product.find({
      expiresIn: { $gt: now },
    }),
    newQuery
  )
    .filter()
    .sort()
    .paginator();

  // Gettin products from database
  const products = await finalQuery.query;

  // Saving current query to session
  req.session.prevQuery = newQuery;

  // Passing data to render the page
  res.locals.shopCurrentTotal = products.length;
  res.locals.shopTotal = products.length;

  if (newQuery.price && typeof newQuery.price === 'object') {
    res.locals.shopPrice = [newQuery.price.$gte, newQuery.price.$lte];
  } else {
    res.locals.shopPrice = null;
  }

  res.locals.shopPrice = newQuery.price
    ? [newQuery.price.$gte, newQuery.price.$lte]
    : null;

  if (newQuery.category && typeof newQuery.category === 'object') {
    res.locals.shopCategory = newQuery.category.$in;
  } else if (newQuery.category && typeof newQuery.category !== 'object') {
    res.locals.shopCategory = [newQuery.category];
  } else {
    res.locals.shopCategory = null;
  }

  if (newQuery.ratingsAverage && typeof newQuery.ratingsAverage === 'object') {
    res.locals.shopRating = newQuery.ratingsAverage.$in;
  } else if (
    newQuery.ratingsAverage &&
    typeof newQuery.ratingsAverage !== 'object'
  ) {
    res.locals.shopRating = [newQuery.ratingsAverage];
  } else {
    res.locals.shopRating = null;
  }
  res.locals.shopSort = newQuery.sort || 'default';
  res.locals.shopLimit = newQuery.limit || 12;
  res.locals.shopPage = newQuery.page || 1;

  res.locals.products = products;
  res.locals.categories = await Category.find();
  res.locals.user = req.session.user
    ? await User.findById(req.session.user._id)
    : null;

  res.render('user/shop');
});

//////////////////////////////////////////////////////////////////////////////
exports.renderCategory = catchAsync.user(async (req, res, next) => {
  res.locals.products = await Product.find();
  res.locals.categories = await Category.find();
  res.locals.user = req.session.user
    ? await User.findById(req.session.user._id)
    : null;
  res.render('user/category');
});

//////////////////////////////////////////////////////////////////////////////
exports.renderProduct = catchAsync.user(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    throw new Error('No product ID');
  }
  const product = await Product.findById(id).populate('category');
  if (!product.name) {
    throw new Error('Invalid product ID');
  }
  // Need to limit the number of reviews and paginate
  res.locals.reviews = await review
    .find({ product: product._id })
    .populate('user');

  res.locals.moment = moment;
  res.locals.categories = await Category.find();
  res.locals.products = await Product.find().limit(10);
  res.locals.product = product;
  res.locals.user = req.session.user
    ? await User.findById(req.session.user._id)
    : null;
  res.render('user/product');
});

//////////////////////////////////////////////////////////////////////////////
exports.renderProfile = catchAsync.user(async (req, res, next) => {
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

  res.locals.states = states;
  res.locals.categories = await Category.find();
  res.locals.user = req.session.user
    ? await User.findById(req.session.user._id)
    : null;
  res.render('user/profile');
});

///////////////////////////////////////////////////////////////////////////////
exports.renderWishlist = catchAsync.user(async (req, res, next) => {
  res.locals.categories = await Category.find();
  res.locals.user = req.session.user
    ? await User.findById(req.session.user._id)
    : null;
  res.render('user/wishlist');
});

/////////////////////////////////////////////////////////////////////////////
exports.mainLiveSearch = catchAsync.other(async (req, res, next) => {
  const payload = req.body.payload.trim();
  const search = await Product.find({
    name: { $regex: new RegExp(`^${payload}.*`, 'i') },
  }).limit(10);
  res.json({
    status: 'success',
    search,
  });
});
