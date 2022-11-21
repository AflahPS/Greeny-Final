const bcrypt = require('bcryptjs');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

exports.renderLogin = catchAsync.user(async (req, res, next) => {
  res.render('auth/login');
});

exports.renderResetPassword = catchAsync.user(async (req, res, next) => {
  res.render('auth/reset-password');
});

exports.renderRegister = catchAsync.user(async (req, res, next) => {
  res.render('auth/register');
});

exports.renderChanePassword = catchAsync.user(async (req, res, next) => {
  res.render('auth/change-password');
});

////////////////////////////////////////////////////////////////////////////////
exports.register = catchAsync.user(async (req, res, next) => {
  const { name, email, password, repeatPassword } = req.body;

  // Validation
  if (!name || !email || !password || !repeatPassword) {
    res.locals.message = 'Please fill all the fields with valid data.';
    return res.render('auth/register');
  }
  if (password !== repeatPassword) {
    res.locals.message = 'Passwords do not match.';
    return res.render('auth/register');
  }
  const user = await User.find({ email });
  if (user.email === email) {
    res.locals.message = 'Email already exists.';
    return res.render('auth/register');
  }

  // data refinement
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  // Creates a new user
  await User.create({
    name,
    email,
    password: hashPassword,
  });
  res.render('auth/login');
});

////////////////////////////////////////////////////////////////////////////////
exports.login = catchAsync.user(async (req, res, next) => {
  // Validations
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('auth/login', { message: 'Fill in the fields !!' });
  }
  const user = await User.findOne({ email }).populate('cart wishlist');
  if (!user) {
    return res.render('auth/login', {
      message: 'Email or Password does not match !!',
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render('auth/login', {
      message: 'Email or Password does not match !!',
    });
  }
  if (user.isBanned) {
    return res.render('auth/login', {
      message: 'Your account has been suspended !!',
    });
  }

  // If Admin
  if (user.role === 'admin' || user.role === 'super-admin') {
    delete user.password;
    req.session.user = user;
    req.session.isAuth = true;
    return res.redirect('/admin');
  }

  // If user
  delete user.role;
  delete user.password;
  req.session.user = user;
  req.session.isAuth = true;
  res.redirect('/home');
});

////////////////////////////////////////////////////////////////////////////////
exports.logout = catchAsync.user(async (req, res, next) => {
  req.session.isAuth = false;
  req.session.destroy((err) => {
    if (err) {
      console.log(err.message);
      return res.redirect('/home');
    }
  });
  res.redirect('/home');
});

////////////////////////////////////////////////////////////////////////////////
exports.changePassword = catchAsync.user(async (req, res, next) => {
  const { oldPassword, newPassword, repeatPassword } = req.body;
  if (!oldPassword || !newPassword || !repeatPassword) {
    return res.render('auth/change-password', {
      message: 'Fill in the fields !!',
    });
  }
  if (newPassword !== repeatPassword) {
    return res.render('auth/change-password', {
      message: 'Passwords mismatch, Please try again !',
    });
  }
  const user = await User.findById(req.session.user._id);
  if (!user) {
    return res.render('auth/change-password', {
      message:
        'It seems like you have been logged out. Please login to continue',
    });
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.render('auth/change-password', {
      message: 'Password mismatch, Please try again !',
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save();
  res.redirect('/profile');
});

// Route protections
////////////////////////////////////////////////////////////////////////////////
exports.redirectHome = (req, res, next) => {
  if (req.session.isAuth) {
    return res.redirect('/home');
  }
  next();
};

////////////////////////////////////////////////////////////////////////////////
exports.redirectLogin = catchAsync.user(async (req, res, next) => {
  if (
    !req.session ||
    !req.session.isAuth ||
    !req.session.user ||
    !req.session.user._id
  ) {
    res.locals.message = 'You must be logged-in to view this page';
    return res.render('auth/login');
  }
  const user = await User.findById(req.session.user._id);
  if (!user) {
    res.locals.message =
      'Sorry, something went very wrong. Please log in again !';
    return res.render('auth/login');
  }
  if (user.isBanned) {
    return res.render('auth/login', {
      message: 'Your account has been suspended !!',
    });
  }
  next();
});

////////////////////////////////////////////////////////////////////////////////
exports.resetAndMailPassword = catchAsync.user(async (req, res, next) => {
  const { email } = req.body;
  // Validation
  if (!email || email === '') {
    const message = `Please enter your registered email address`;
    return res.render('auth/reset-password', { message });
  }
  const user = await User.findOne({ email });
  if (!user) {
    const message = `Could not find user with email ${email}`;
    return res.render('auth/reset-password', { message });
  }

  // Generate and save new password
  const newPassword = Math.round(Math.random() * 100000000).toString();
  const generatedAt = new Date().toLocaleString('en-In');
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedNewPassword;
  await user.save();

  // Sending the mail
  try {
    const emailOptions = {
      email: user.email,
      subject: 'Password Reset',
      message: `Hello ${user.name}, 
      Your newly generated password is : ${newPassword}
      Generated at : ${generatedAt}
      Please login again --> greeny.com/login`,
    };
    await sendEmail(emailOptions);
    return res.render('auth/login', {
      message: 'New password sent, Please login with your new password',
    });
  } catch (err) {
    console.log(err);
    const message = `Sorry, something went wrong ! Please try again.`;
    res.render('auth/reset-password', { message });
  }
});
////////////////////////////////////////////////////////////////////////////////
exports.restrictTo = (...roles) =>
  catchAsync.user(async (req, res, next) => {
    const role =
      req.session.user.role ||
      (await User.findById(req.session.user._id).select('role ')).role;
    if (roles.includes(role)) {
      return next();
    }
    throw new Error('You are not authorised for this route/action');
  });
