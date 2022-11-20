const multer = require('multer');
const sharp = require('sharp');
const Category = require('../models/category');
const catchAsync = require('../utils/catchAsync');

let message = null;

// Render functions
////////////////////////////////////////////////////////////////////////
exports.renderCategoryAdd = catchAsync.admin(async (req, res, next) => {
  res.render('admin/category-add');
});

////////////////////////////////////////////////////////////////////////
exports.renderCategoryList = catchAsync.admin(async (req, res, next) => {
  // For pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  const cats = await Category.find()
    .populate('lastUpdatedBy')
    .sort('-createdAt')
    .select('-__v')
    .skip(skip)
    .limit(limit);

  res.locals.message = message;
  res.render('admin/category-list', {
    cats,
  });
});

////////////////////////////////////////////////////////////////////////
exports.renderCategoryUpdate = catchAsync.admin(async (req, res, next) => {
  // Validation
  if (!req.query.id) {
    throw new Error('Valid category ID not found in the query');
  }

  const category = await Category.findById(req.query.id);
  res.render('admin/category-update', { category });
});

////////////////////////////////////////////////////////////////////////
exports.renderCategoryUpdate = catchAsync.admin(async (req, res, next) => {
  // Validation
  if (!req.query.id) {
    throw new Error('Valid category ID not found in the query');
  }

  const category = await Category.findById(req.query.id);
  res.render('admin/category-update', { category });
});

// CRUD Ops
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

exports.uploadCategoryThumb = upload.single('thumbnail');

////////////////////////////////////////////////////////////////////////////
exports.resizeCategoryThumb = (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  req.file.filename = `${req.body.name}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(150, 150)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/category/${req.file.filename}`);

  next();
};

////////////////////////////////////////////////////////////////////////
exports.addCategory = catchAsync.admin(async (req, res, next) => {
  const body = { ...req.body };
  // Validation
  if (!body.name) {
    message = 'Not found valid data on fields while creating category !';
    res.redirect('/admin/category-list');
  }
  const category = await Category.find({ name: body.name });
  // Check: Category already exists ?
  if (category.length > 0) {
    message = 'Category already exists';
    res.redirect('/admin/category-list');
  }

  // data refinement
  if (req.file) {
    body.thumbnail = req.file.filename;
  } else {
    delete body.thumbnail;
  }
  body.lastUpdatedBy = req.session.user._id;

  console.log(body);

  // Create Category
  await Category.create(body);
  message = 'Category created successfully !';
  res.redirect('/admin/category-list');
});

////////////////////////////////////////////////////////////////////////
exports.updateCategory = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  const body = { ...req.body };
  if (!id) {
    throw new Error('Invalid category id !');
  }
  if (!body.name) {
    message = 'No/Invalid data provided!';
    return res.redirect('/admin/category-list');
  }
  // data refinement
  if (req.file) {
    body.thumbnail = req.file.filename;
  }
  body.lastUpdatedBy = req.session.user._id;

  const category = await Category.findByIdAndUpdate(id, body);

  // Check if category updated
  if (!category) {
    message = 'Category Not found in database!';
    return res.redirect('/admin/category-list');
  }

  message = 'Category updated successfully !';
  res.redirect('/admin/category-list');
});

////////////////////////////////////////////////////////////////////////
exports.deleteCategory = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid category id !');
  }
  const category = await Category.findById(id);
  // Check if category has products in it
  if (category.totalProducts > 0) {
    message = `Category is not empty, total products: ${category.totalProducts}`;
    return res.redirect('/admin/category-list');
  }

  // Deletion
  await Category.findByIdAndDelete(id);
  message = 'Successfully deleted the category !';
  res.redirect('/admin/category-list');
});

//////////////////////////////////////////////////////////////////////
exports.banCategory = catchAsync.admin(async (req, res, next) => {
  // Validation
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid category id !');
  }
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found !');
  }

  // Banning
  category.isActive = !category.isActive;
  await category.save();
  message = category.isActive
    ? 'Successfully activated the category !'
    : 'Successfully deactivated the category !';
  message = 'Successfully de-activated the category !';
  res.redirect('/admin/category-list');
});