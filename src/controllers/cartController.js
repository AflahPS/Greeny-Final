const Cart = require('../models/cart');
const Product = require('../models/product');
// const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

/////////////////////////////////////////////////////////////////////////////////////
exports.checkUserBeforeCartAction = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.json({
      status: 'failed',
      message: 'User is not logged in',
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////
exports.checkUserBeforeWishAction = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.json({
      status: 'failed',
      message: 'User is not logged in',
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////
const addToCart = async (cart, product, uid) => {
  //1) If the user has no cart, then create.
  if (!cart || !cart.user) {
    await Cart.create({
      user: uid,
      cartType: 'cart',
      products: {
        product: product._id,
        quantity: 1,
      },
      discount: (product.price * product.discount) / 100,
      totalAmount: product.price,
    });
    const newCart = await Cart.findOne({
      user: uid,
      cartType: 'cart',
    }).populate('products.product');
    return newCart;
  }

  //2) If user has cart and the product already exists,
  // then increase quantity.

  if (
    cart.products.some(
      (el) => el.product._id.toString() === product._id.toString()
    )
  ) {
    const index = cart.products.findIndex(
      (el) => el.product._id.toString() === product._id.toString()
    );
    cart.products[index].quantity += 1;
    cart.discount =
      (cart.products[index].quantity * product.price * product.discount) / 100;
    cart.totalAmount += product.price;
    await cart.save();
    const newCart = await Cart.findOne({
      user: uid,
      cartType: 'cart',
    }).populate('products.product');
    return newCart;
  }

  //3) If user has cart and the product is not in the cart,
  // then push the product to the cart.

  cart.products.push({
    product: product._id,
    quantity: 1,
  });
  cart.discount += (product.price * product.discount) / 100;
  cart.totalAmount += product.price;
  await cart.save();
  const newCart = await Cart.findOne({
    user: uid,
    cartType: 'cart',
  }).populate('products.product');
  return newCart;
};

///////////////////////////////////////////////////////////////////////////////////////////
const removeFromCart = async (uid, pid) => {
  const product = await Product.findById(pid);
  const cart = await Cart.findOne({ user: uid, cartType: 'cart' }).populate(
    'products.product'
  );

  const index = cart.products.findIndex(
    (el) => el.product._id.toString() === pid
  );

  //A) if product quantity is greater than 1,
  // then decrese quantity.
  if (cart.products[index].quantity > 1) {
    cart.products[index].quantity -= 1;
    cart.discount =
      (cart.products[index].quantity * product.price * product.discount) / 100;
    cart.totalAmount -= product.price;
    await cart.save();
    const newCart = await Cart.findOne({
      user: uid,
      cartType: 'cart',
    }).populate('products.product');
    return newCart;
  }

  //2B) if product quantity is 1,
  // then remove product from cart completely.

  cart.products.splice(index, 1);
  cart.discount -= (product.price * product.discount) / 100;
  cart.totalAmount -= product.price;

  await cart.save();
  const newCart = await Cart.findOne({
    user: uid,
    cartType: 'cart',
  }).populate('products.product');
  return newCart;
};

///////////////////////////////////////////////////////////////////////////////////////////
exports.addToCartAction = catchAsync.other(async (req, res, next) => {
  // Gettin data from the request
  const { pid } = req.body;
  const { action } = req.body;

  // Validation
  if (!pid || !action || !['add', 'remove'].includes(action)) {
    return res.json({
      status: 'failed',
      message: 'Product ID or valid action not specified',
    });
  }

  // Gathering data from the database
  const product = await Product.findById(pid);
  const uid = req.session.user._id;
  const cart = await Cart.findOne({ user: uid, cartType: 'cart' }).populate(
    'products.product'
  );

  //1) Adding the product
  if (action === 'add') {
    // Check if the product is sold out before adding it to cart
    if (cart && cart.products && cart.products.length > 0) {
      const productObject = cart.products.find(
        (el) => el.product._id.toString() === product._id.toString()
      );
      if (productObject) {
        const { quantity } = productObject;
        if (quantity >= product.stock) {
          return res.json({
            status: 'failed',
            cart,
            message: 'Product got sold out !',
          });
        }
      }
    }
    const newCart = await addToCart(cart, product, uid);
    req.session.cart = newCart._id;

    return res.json({
      status: 'success',
      cart: newCart,
      message: 'Product added successfully !',
    });

    //2) Remove the product from the cart.
  }
  if (action === 'remove') {
    const newCart = await removeFromCart(uid, pid);
    return res.json({
      status: 'success',
      cart: newCart,
      message: 'Product removed successfully !',
    });
  }
  return res.json({
    status: 'failed',
    cart,
    message: 'Something went very wrong !',
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
exports.plusAction = catchAsync.user(async (req, res, next) => {
  // Gathering data from the server
  const uid = req.session.user._id;
  const { pid } = req.body;

  // Gathering data from the database
  const product = await Product.findById(pid);
  const cart = await Cart.findOne({ user: uid, cartType: 'cart' }).populate(
    'products.product'
  );

  // Check if the product is sold out before adding it to cart
  if (cart && cart.products && cart.products.length > 0) {
    const productObject = cart.products.find(
      (el) => el.product._id.toString() === product._id.toString()
    );
    const { quantity } = productObject;
    if (quantity >= product.stock) {
      return res.json({
        status: 'failed',
        cart,
        message: 'Product got sold out !',
      });
    }
  }

  const newCart = await addToCart(cart, product, uid);

  req.session.cart = newCart._id;
  res.json({
    status: 'success',
    cart: newCart,
    message: 'Product added successfully !',
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
exports.minusAction = catchAsync.user(async (req, res, next) => {
  const uid = req.session.user._id;
  const { pid } = req.body;

  const cart = await removeFromCart(uid, pid);
  res.json({
    status: 'success',
    cart,
    message: 'Product removed successfully !',
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
exports.removeProductFromCart = catchAsync.other(async (req, res, next) => {
  const uid = req.session.user._id;
  const { pid } = req.body;

  // const product = await Product.findById(pid);
  const cart = await Cart.findOne({
    user: uid,
    cartType: 'cart',
  }).populate('products.product');

  const index = cart.products.findIndex(
    (el) => el.product._id.toString() === pid
  );
  cart.products.splice(index, 1);
  cart.totalAmount = cart.products.reduce(
    (acc, cur) => acc + cur.product.price * cur.quantity,
    0
  );
  cart.discount = cart.products.reduce(
    (acc, cur) =>
      acc + (cur.quantity * cur.product.price * cur.product.discount) / 100,
    0
  );
  await cart.save();

  const newCart = await Cart.findOne({
    user: uid,
    cartType: 'cart',
  }).populate('products.product');

  res.json({
    status: 'success',
    cart: newCart,
    message: 'Product removed successfully !',
  });
});
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

const wishAction = async (uid, pid) => {
  const wish = await Cart.findOne({ user: uid, cartType: 'wishlist' });

  //1) If the user has no wish, then create.
  if (!wish || !wish.user) {
    await Cart.create({
      user: uid,
      cartType: 'wishlist',
      products: {
        product: pid,
        quantity: 1,
      },
    });
    const newWish = await Cart.findOne({
      user: uid,
      cartType: 'wishlist',
    }).populate('products.product');
    const message = `Product added successfully to new Wishlist`;
    return [newWish, message];
  }

  //2) If user has wish and the product already exists,
  // Remove the existing product from the wish list
  if (wish.products.some((el) => el.product._id.toString() === pid)) {
    const index = wish.products.findIndex(
      (el) => el.product._id.toString() === pid
    );

    wish.products.splice(index, 1);
    await wish.save();
    const newWish = await Cart.findOne({
      user: uid,
      cartType: 'wishlist',
    }).populate('products.product');
    const message = `Product removed successfully from Wishlist`;
    return [newWish, message];
  }

  //3) If user has wish and the product is not in the wish,
  // then push the product to the wish.
  wish.products.push({
    product: pid,
    quantity: 1,
  });
  await wish.save();
  const newWish = await Cart.findOne({
    user: uid,
    cartType: 'wishlist',
  }).populate('products.product');
  const message = `Product added successfully to existing Wishlist`;
  return [newWish, message];
};

/////////////////////////////////////////////////////////////////////////
exports.addToWishAction = catchAsync.user(async (req, res, next) => {
  const { pid } = req.body;
  if (!pid) {
    return res.json({
      status: 'failed',
      message: 'Product ID not specified/Invalid',
    });
  }
  const uid = req.session.user._id;

  const wish = await wishAction(uid, pid);

  res.json({
    status: 'success',
    wishlist: wish[0],
    message: wish[1],
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
exports.removeProductFromWish = catchAsync.other(async (req, res, next) => {
  const uid = req.session.user._id;
  const { pid } = req.body;

  // const product = await Product.findById(pid);
  const wishlist = await Cart.findOne({
    user: uid,
    cartType: 'wishlist',
  });

  const index = wishlist.products.findIndex(
    (el) => el.product.toString() === pid
  );
  // cart.totalAmount -= cart.products[index].quantity * product.price;
  wishlist.products.splice(index, 1);
  await wishlist.save();

  res.json({
    status: 'success',
    wishlist,
    message: 'Product removed successfully !',
  });
});

/////////////////////////////////////////////////////////////////////////
exports.cartClear = async (cartId) => {
  const cart = await Cart.findById(cartId);
  cart.products.forEach(async (obj) => {
    const product = await Product.findById(obj.product);
    product.stock -= obj.quantity;
    await product.save();
  });
  await cart.remove();
};
