const express = require('express');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const couponController = require('../controllers/couponController');
const orderController = require('../controllers/orderController');
const bannerController = require('../controllers/bannerController');

const router = express.Router();

//////////////////////////////// Dashboard //////////////////////////////

router.route('/').get(adminController.renderDashboard);

router.route('/chart-doughnut').get(adminController.chartDataDoughnut);
router.route('/chart-daily').get(adminController.chartDataDaily);
router.route('/chart-weekly').get(adminController.chartDataWeekly);
router.route('/chart-monthly').get(adminController.chartDataMonthly);

router.route('/custom-orders').post(adminController.customOrders);

///////////////////////////////// Category //////////////////////////////

// Render
router.route('/category-list').get(categoryController.renderCategoryList);
router.route('/category-add').get(categoryController.renderCategoryAdd);
router.route('/category-update').get(categoryController.renderCategoryUpdate);

// CRUD Ops
router
  .route('/category')
  .post(
    categoryController.uploadCategoryThumb,
    categoryController.resizeCategoryThumb,
    categoryController.addCategory
  )
  .patch(
    categoryController.uploadCategoryThumb,
    categoryController.resizeCategoryThumb,
    categoryController.updateCategory
  )
  .delete(categoryController.deleteCategory);

router.route('/ban-category').get(categoryController.banCategory);

//////////////////////////////// Product //////////////////////////////

// Render
router.route('/product-list').get(productController.renderProductList);
router.route('/product-single').get(productController.renderProductSingle);
router.route('/product-update').get(productController.renderProductUpdate);
router.route('/product-add').get(productController.renderAddProduct);

// CRUD Ops
router
  .route('/product')
  .post(
    productController.uploadProductPic,
    productController.resizeProductPic,
    productController.addProduct
  );
//TODO: PATCH method
router
  .route('/product-update')
  .post(
    productController.uploadProductPic,
    productController.resizeProductPic,
    productController.updateProduct
  );
//TODO: DELETE method
router.route('/delete-product').get(productController.deleteProduct);
router.route('/ban-product').get(productController.banProduct);

///////////////////////////////// User ////////////////////////////////

// Render
router.route('/user-list').get(userController.renderUserList);
router.route('/user-single').get(userController.renderUserSingle);

// CRUD Ops
router.route('/user').post(userController.addUser);
//TODO: DELETE method
router.route('/delete-user').get(userController.deleteUser);
router.route('/ban-user').get(userController.banUser);

//////////////////////////////// Order ////////////////////////////////

router.route('/order-list').get(orderController.renderOrderListAdmin);
router.route('/order-single').get(orderController.renderOrderSingle);
//TODO: PATCH method
router.route('/order-cancel').get(orderController.cancelOrderAdmin);
//TODO: PATCH method
router.route('/order-status').patch(orderController.changeOrderStatus);

//////////////////////////////// Coupon ////////////////////////////////

router.route('/coupon-list').get(couponController.renderCouponList);
router.route('/coupon-update').get(couponController.renderCouponUpdate);
router.route('/coupon-add').get(couponController.renderAddCoupon);

// CRUD Ops

router
  .route('/coupon')
  .post(
    couponController.uploadCouponThumb,
    couponController.resizeCouponThumb,
    couponController.addCoupon
  );
//TODO: PATCH method
router
  .route('/coupon-update')
  .post(
    couponController.uploadCouponThumb,
    couponController.resizeCouponThumb,
    couponController.editCoupon
  );
//TODO: DELETE method
router.route('/delete-coupon').get(couponController.deleteCoupon);

router.route('/ban-coupon').get(couponController.banCoupon);

//////////////////////////////// Banner //////////////////////////////////

router.route('/banner-list').get(bannerController.renderBannerList);

router.route('/banner-add').get(bannerController.renderAddBanner);

router
  .route('/banner')
  .post(
    bannerController.uploadBannerImage,
    bannerController.resizeBannerImage,
    bannerController.addBanner
  );
//TODO: PATCH method
router
  .route('/banner-update')
  .get(bannerController.renderEditBanner)
  .post(
    bannerController.uploadBannerImage,
    bannerController.resizeBannerImage,
    bannerController.editBanner
  );
//TODO: DELETE method
router.route('/delete-banner').get(bannerController.deleteBanner);
router.route('/ban-banner').get(bannerController.applyBanner);

//////////////////////////////// 404 //////////////////////////////////

router.route('*').all((req, res) => {
  res.locals.message = 'URL not found';
  res.render('admin/404');
});

module.exports = router;
