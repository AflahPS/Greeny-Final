const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
// eslint-disable-next-line no-unused-vars
const ejs = require('ejs');

// Controllers
const authController = require('./src/controllers/authController');
const userController = require('./src/controllers/userController');
const adminRouter = require('./src/routes/adminRouter');
const commonRouter = require('./src/routes/commonRouter');

const app = express();

dotenv.config({ path: './config.env' });

// DB Connection

const DB = process.env.DB_CLOUD.replace('<password>', process.env.DB_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  });

// Express setups

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/src/views'));

// Middlewares

const sessionAge = 1000 * 60 * 60 * 24; // 24 hours
app.use(
  session({
    name: 'sess',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionAge,
      sameSite: true,
    },
  })
);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.locals.message = null;
  next();
});

// Render app routes
app.use('/', commonRouter);
app.use(
  '/admin',
  // authController.redirectLogin,
  authController.restrictTo('admin'),
  userController.adminPopulator,
  adminRouter
);

// catch 404 and forward to error handler

app.all('*', (req, res, next) => {
  if (req.session && req.session.isAuth) {
    return res.render('user/error', { user: req.session.user });
  }
  res.render('user/error', { user: null });
});

const port = process.env.PORT || '3000';
app.listen(port, () => console.log(`Server running on port: ${port}`));
