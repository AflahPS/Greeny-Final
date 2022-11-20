const Review = require('../models/review');
const Product = require('../models/product');
const catchAsync = require('../utils/catchAsync');

exports.addReview = catchAsync.user(async (req, res, next) => {
  const { rating, content } = req.body;
  const pid = req.query.product;
  const product = await Product.findById(pid);
  const newReview = {
    user: req.session.user._id,
    product: pid,
    content,
    rating,
  };
  await Review.create(newReview);
  product.ratingsTotal = product.ratingsTotal ? product.ratingsTotal + 1 : 2;
  product.ratingsAverage =
    (product.ratingsAverage + parseInt(rating, 10)) / product.ratingsTotal;
  await product.save();
  res.redirect(`/product?id=${pid}`);
});
