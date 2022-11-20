const moment = require('moment');
const multer = require('multer');
const sharp = require('sharp');
const Banner = require('../models/banner');
const catchAsync = require('../utils/catchAsync');

let message = null;

////////////////////////////////////////////////////////////////////////////
exports.renderBannerList = catchAsync.admin(async (req, res, next) => {
  const banners = await Banner.find();
  res.locals.message = message;
  res.locals.banners = banners;
  res.locals.moment = moment;
  res.render('admin/banner-list');
});

////////////////////////////////////////////////////////////////////////////
exports.renderAddBanner = catchAsync.admin(async (req, res, next) => {
  res.render('admin/banner-add');
});

////////////////////////////////////////////////////////////////////////////
exports.renderEditBanner = catchAsync.admin(async (req, res, next) => {
  const { id } = req.query;
  const banner = await Banner.findById(id);
  if (!banner) {
    throw new Error('banner not found');
  }
  res.locals.banner = banner;
  res.render('admin/banner-update');
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
exports.uploadBannerImage = upload.single('image');

////////////////////////////////////////////////////////////////////////////
exports.resizeBannerImage = (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  req.file.filename = `${req.body.name}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
    // .resize(500, 500, { fit: 'contain' })
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/banner/${req.file.filename}`);

  next();
};

////////////////////////////////////////////////////////////////////////////
exports.addBanner = catchAsync.admin(async (req, res, next) => {
  const data = { ...req.body };

  // Validation
  if (
    !data.name ||
    !data.textPosition ||
    !['left', 'right'].includes(data.textPosition) ||
    !data.textHeader ||
    !data.textContent
  ) {
    message = 'Not found valid data on fields while creating Banner !';
    res.redirect('/admin/banner-list');
  }

  const banner = await Banner.find({ name: data.name });

  // Coupon already exists
  if (banner.length > 0) {
    message = 'Banner name already exists';
    res.redirect('/admin/banner-list');
  }

  // data refinement
  if (req.file) {
    data.image = req.file.filename;
  } else {
    delete data.image;
  }
  // Create coupon
  await Banner.create(data);
  message = 'banner created successfully !';
  res.redirect('/admin/banner-list');
});

////////////////////////////////////////////////////////////////////////////
exports.editBanner = catchAsync.admin(async (req, res, next) => {
  const data = { ...req.body };
  const { id } = req.query;

  // Validation
  if (
    !data.name ||
    !data.textPosition ||
    !['left', 'right'].includes(data.textPosition) ||
    !data.textHeader ||
    !data.textContent
  ) {
    message = 'Not found valid data on fields while creating Banner !';
    res.redirect('/admin/banner-list');
  }

  // data refinement
  if (req.file) {
    data.image = req.file.filename;
  } else {
    delete data.image;
  }

  const banner = await Banner.findByIdAndUpdate(id, data, {
    runValidators: true,
  });

  if (!banner) {
    message = 'Not found valid data to create Banner !';
    res.redirect('/admin/banner-list');
  }

  message = 'banner updated successfully !';
  res.redirect('/admin/banner-list');
});

////////////////////////////////////////////////////////////////////////////
exports.deleteBanner = catchAsync.admin(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the banner');
  }
  await Banner.findByIdAndDelete(id);
  message = 'Successfully deleted the coupon !';
  res.redirect('/admin/banner-list');
});

////////////////////////////////////////////////////////////////////////////
exports.applyBanner = catchAsync.admin(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    throw new Error('Invalid id provided for the banner');
  }
  const banner = await Banner.findById(id);
  if (!banner) {
    message = 'banner not found in database !';
    res.redirect('/admin/banner-list');
  }
  banner.isActive = !banner.isActive;
  await banner.save();
  message = banner.isActive
    ? 'Successfully activated the banner'
    : 'Successfully deActivated the banner';
  res.redirect('/admin/banner-list');
});
