const express = require('express');
const cors = require('cors');
const commonController = require('../controllers/commonController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();
router.use(cors());

////////////////////////////////////////////////////////////////////////////////
/////////////////////// Authentication routes //////////////////////////////////

router
  .route('/login')
  .get(authController.redirectHome, authController.renderLogin)
  .post(authController.login);

router
  .route('/reset-password')
  .get(authController.renderResetPassword)
  .post(authController.resetAndMailPassword);

router.route('/logout').get(authController.logout);
//TODO: PATCH method
router
  .route('/change-password')
  .get(authController.redirectLogin, authController.renderChanePassword)
  .post(authController.changePassword);

router
  .route('/register')
  .get(authController.renderRegister)
  .post(authController.register);

//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Common routes  ////////////////////////////////////////////

router
  .route('/')
  .get(userController.userPopulator, commonController.renderHome);
router
  .route('/home')
  .get(userController.userPopulator, commonController.renderHome);
router
  .route('/shop')
  .get(userController.userPopulator, commonController.renderShop);

router
  .route('/category')
  .get(userController.userPopulator, commonController.renderCategory);

router
  .route('/product')
  .get(userController.userPopulator, commonController.renderProduct);

router.route('/main-live-search').post(commonController.mainLiveSearch);

////////////////////////////////////////////////////////////////////////////////////
/////////////////////// USERS ONLY - AUTHORISED ROUTES /////////////////////////////

router
  .route('/profile')
  .get(
    authController.redirectLogin,
    userController.userPopulator,
    commonController.renderProfile
  );

router
  .route('/invoice')
  .get(
    authController.redirectLogin,
    userController.userPopulator,
    orderController.renderInvoice
  );

router
  .route('/orders')
  .get(
    authController.redirectLogin,
    userController.userPopulator,
    orderController.renderOrderListUser
  );
//TODO: PATCH method
router
  .route('/profile-add-address')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    userController.addAddressProfile
  );
//TODO: PATCH method
router
  .route('/profile-edit-details')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    userController.uploadProfilePic,
    userController.resizeProfilePic,
    userController.editProfile
  );

//TODO: PATCH method
router
  .route('/profile-edit-address')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    userController.editAddressProfile
  );
//TODO: PATCH method
router
  .route('/profile-remove-address')
  .post(authController.redirectLogin, userController.removeAddressProfile);

///////////////////////////////////////////////////////////////////////////
////////////////////////////////// CART ///////////////////////////////////

router
  .route('/cart-main')
  .post(
    cartController.checkUserBeforeCartAction,
    userController.userPopulator,
    cartController.addToCartAction
  );
//TODO: PATCH method
router
  .route('/cart-plus')
  .post(
    cartController.checkUserBeforeCartAction,
    userController.userPopulator,
    cartController.plusAction
  );
//TODO: PATCH method
router
  .route('/cart-minus')
  .post(
    cartController.checkUserBeforeCartAction,
    userController.userPopulator,
    cartController.minusAction
  );
//TODO: PATCH method
router
  .route('/cart-remove')
  .post(
    cartController.checkUserBeforeCartAction,
    userController.userPopulator,
    cartController.removeProductFromCart
  );

/////////////////////////////////////////////////////////////////////////////
//////////////////////////////// WISHLIST //////////////////////////////////

router
  .route('/wishlist')
  .get(
    authController.redirectLogin,
    userController.userPopulator,
    commonController.renderWishlist
  );
//TODO: PATCH method
router
  .route('/wish-main')
  .post(
    cartController.checkUserBeforeWishAction,
    userController.userPopulator,
    cartController.addToWishAction
  );
//TODO: PATCH method
router
  .route('/wish-remove')
  .post(
    cartController.checkUserBeforeWishAction,
    userController.userPopulator,
    cartController.removeProductFromWish
  );

////////////////////////////////////////////////////////////////////////
//////////////////////////// CHECKOUT //////////////////////////////////

router
  .route('/checkout')
  .get(
    authController.redirectLogin,
    userController.userPopulator,
    orderController.renderCheckout
  );
//TODO: PATCH method
router
  .route('/checkout-add-address')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    userController.addAddressCheckout
  );
//TODO: PATCH method
router
  .route('/checkout-remove-address')
  .post(authController.redirectLogin, userController.removeAddressCheckout);
//TODO: PATCH method
router
  .route('/checkout-edit-address')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    userController.editAddressCheckout
  );

router
  .route('/proceed-to-pay')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    orderController.proceedPayment
  );

router
  .route('/verify-payment')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    orderController.verifyPayment
  );

router
  .route('/coupon-apply')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    couponController.verifyCoupon
  );
//TODO: PATCH method
router
  .route('/order-cancel')
  .get(
    authController.redirectLogin,
    userController.userPopulator,
    orderController.cancelOrderUser
  );

////////////////////////////////////////////////////////////////////////
//////////////////////////// REVIEW //////////////////////////////////

router
  .route('/review')
  .post(
    authController.redirectLogin,
    userController.userPopulator,
    reviewController.addReview
  );

module.exports = router;
