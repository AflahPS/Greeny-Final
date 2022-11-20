const mongoose = require('mongoose');
const sharp = require('sharp');
const multer = require('multer');
const moment = require('moment');
const Product = require('../models/product');
const Category = require('../models/category');
const catchAsync = require('../utils/catchAsync');

let message = null;

// Render functions

////////////////////////////////////////////////////////////////////////
exports.renderProductList = catchAsync.admin(async (req, res, next) => {
  // For pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  // Fetching the products from the database
  const products = await Product.find()
    .sort('-createdAt')
    .select('-__v')
    .skip(skip)
    .limit(limit)
    .populate('category');

  console.log(products);

  res.locals.message = message;
  res.render('admin/product-list', {
    products,
    moment,
  });
});

////////////////////////////////////////////////////////////////////////
exports.renderAddProduct = catchAsync.admin(async (req, res, next) => {
  res.locals.categories = await Category.find().select('name');
  res.render('admin/product-add');
});

////////////////////////////////////////////////////////////////////////
exports.renderProductSingle = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Product id not found!');
  }

  // Fetching the product from the database
  const product = await Product.findById(id).populate('category');
  if (!product) {
    throw new Error('Product not found in database !');
  }

  res.locals.categories = await Category.find();
  res.render('admin/product-single', { product, moment });
});

////////////////////////////////////////////////////////////////////////
exports.renderProductUpdate = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Product id not found!');
  }

  // Fetching the product from the database
  const product = await Product.findById(id).populate('category');
  if (!product) {
    throw new Error('Product not found in the database !');
  }

  res.locals.categories = await Category.find();
  res.render('admin/product-update', { product });
});

// Non-Render functions
////////////////////////////////////////////////////////////////////////

//Multer setup
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

// Upload function
exports.uploadProductPic = upload.fields([
  {
    name: 'thumbnail',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 6,
  },
]);

////////////////////////////////////////////////////////////////////////////
exports.resizeProductPic = catchAsync.admin(async (req, res, next) => {
  //Validations
  if (!req.files || !req.files.thumbnail || !req.files.images) return next();

  // Get the thumbnail
  req.body.thumbnail = `product-${Date.now()}-thumb.jpeg`;

  await sharp(req.files.thumbnail[0].buffer)
    .resize(450, 450)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/product/${req.body.thumbnail}`);

  // Get the images array
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (el, i) => {
      const filename = `product-${Date.now()}-${i + 1}-image.jpeg`;
      await sharp(req.files.images[i].buffer)
        .resize(450, 450)
        .toFormat('jpeg')
        .jpeg({
          quality: 90,
        })
        .toFile(`public/images/product/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

////////////////////////////////////////////////////////////////////////
exports.addProduct = catchAsync.admin(async (req, res, next) => {
  const data = { ...req.body };
  // Validation
  if (
    !data.name ||
    !data.category ||
    !data.description ||
    !data.stock ||
    !data.price ||
    !data.unitIn ||
    !data.tags
  ) {
    message = 'Failed to add product: invalid/no data on fields !';
    return res.redirect('/admin/product-list');
  }
  if (!data.brand) {
    delete data.brand;
  }

  // Check: Product name already exists ?
  const product = await Product.find({ name: data.name });
  if (product.length > 0) {
    message = 'Product name already exists !';
    return res.redirect('/admin/product-list');
  }

  // data refinement
  data.stock = parseInt(data.stock, 10);
  data.price = parseInt(data.price, 10);
  data.tags = data.tags.split(',');
  data.category = mongoose.Types.ObjectId(data.category);

  // Incrementing the product count in the corresponding category
  const category = await Category.findById(data.category);
  category.totalProducts += 1;
  await category.save();

  // Create product
  await Product.create(data);
  message = 'Product created successfully !';
  res.redirect('/admin/product-list');
});

////////////////////////////////////////////////////////////////////////
exports.updateProduct = catchAsync.admin(async (req, res, next) => {
  const { id } = req.query;
  const data = { ...req.body };
  // Validation
  if (!id) {
    throw new Error('Invalid Id to update the product !');
  }
  if (
    !data.name ||
    !data.category ||
    !data.description ||
    !data.stock ||
    !data.price ||
    !data.unitIn ||
    !data.tags
  ) {
    message = 'Failed to add product: invalid/no data on fields !';
    return res.redirect('/admin/product-list');
  }

  // data refinement
  data.stock = parseInt(data.stock, 10);
  data.price = parseInt(data.price, 10);
  data.discount = parseInt(data.discount, 10);
  data.tags = data.tags.split(',');
  data.category = mongoose.Types.ObjectId(data.category);

  // Update the product
  await Product.findByIdAndUpdate(id, data);
  message = 'Product edited successfully !';
  res.redirect(`/admin/product-single?id=${id}`);
});

////////////////////////////////////////////////////////////////////////
exports.deleteProduct = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('No Id to delete the product!');
  }
  const product = await Product.findById(id);
  if (!product) {
    throw new Error('Product not found!');
  }

  // Decrement the product count in the category.totalProducts
  const category = await Category.findById(product.category);
  category.totalProducts -= 1;
  category.save();

  console.log(id);

  // Deletion
  await Product.findByIdAndDelete(id);
  message = 'Successfully deleted the product !';
  res.redirect('/admin/product-list');
});

//////////////////////////////////////////////////////////////////////
exports.banProduct = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Product id not found !');
  }
  const product = await Product.findById(id);
  if (!Product.length) {
    throw new Error('product not found !');
  }

  // Banning
  product.isActive = !product.isActive;
  await product.save();
  message = product.isActive
    ? 'Successfully activated the product !'
    : 'Successfully deactivated the product !';
  res.redirect('/admin/product-list');
});

////////////////////////////////////////////////////////////////////////
exports.filterByPrice = (query, products) => {
  if (Array.isArray(query) && query.length === 2) {
    const min = Math.min(parseInt(query[0], 10), parseInt(query[1], 10));
    const max = Math.max(parseInt(query[0], 10), parseInt(query[1], 10));
    const prods = products.filter((el) => el.price >= min && el.price <= max);
    return prods;
  }
};

////////////////////////////////////////////////////////////////////////
exports.filterByCategory = (query, products) => {
  // If array of categories
  let prods;
  if (Array.isArray(query)) {
    prods = products.filter((el) => query.includes(el.category.name));
    // if single category
  } else {
    prods = products.filter((el) => el.category.name === query);
  }
  return prods;
};

////////////////////////////////////////////////////////////////////////
exports.filterByRatings = (query, products) => {
  let prods;
  // Array of ratings
  if (Array.isArray(query)) {
    prods = products.filter((el) =>
      query.includes(String(Math.round(el.ratingsAverage)))
    );
    // if single rating
  } else {
    prods = products.filter(
      (el) => String(Math.round(el.ratingsAverage)) === query
    );
  }
  return prods;
};

////////////////////////////////////////////////////////////////////////
exports.sort = (query, products) => {
  if (query === 'price-ascending') {
    products.sort((a, b) => a.price - b.price);
  }
  if (query === 'price-descending') {
    products.sort((a, b) => b.price - a.price);
  }
  if (query === 'popular') {
    products.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
  }
  if (query === 'newly-added' || query === 'dafault') {
    products.sort((a, b) => b.createdAt - a.createdAt);
  }
  return products;
};

////////////////////////////////////////////////////////////////////////
exports.limit = (limit, page, products) => {
  const skip = (page - 1) * limit;
  const prods = products.slice(skip, skip + limit);
  return prods;
};