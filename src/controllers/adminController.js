/* eslint-disable no-plusplus */
const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const Review = require('../models/review');
const Order = require('../models/order');
const Product = require('../models/product');
const Category = require('../models/category');

/////////////////////////////////////////////////////////////////////////////////////////
function getArrayOfDates(number, period, format) {
  const last = [];
  for (let i = 0; i < number; ++i) {
    const now = moment();
    last.push(now.subtract(i, period).format(format));
  }
  return last;
}

/////////////////////////////////////////////////////////////////////////////////////////
function arrayOfStartEnd(number, period) {
  const last = [];
  for (let i = 0; i < number; ++i) {
    const now1 = moment();
    const now2 = moment();
    const newObj = {
      start: now1.subtract(i, period).startOf(period).toDate(),
      end: now2.subtract(i, period).endOf(period).toDate(),
    };
    last.push(newObj);
  }

  return last;
}

////////////////////////////////////////////////////////////////////////////////
exports.renderDashboard = catchAsync.admin(async (req, res, next) => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const dailySignups = await User.find({
    createdAt: { $gte: startOfToday },
  }).count();

  const newCustomers = await User.find().sort('-createdAt').limit(5);

  const dailyReviews = await Review.find({
    createdAt: { $gte: startOfToday },
  }).count();

  const dailyOrders = await Order.find({
    createdAt: { $gte: startOfToday },
  }).count();

  const dailyRevenue = await Order.aggregate([
    {
      $match: { createdAt: { $gte: startOfToday } },
    },
    {
      $group: {
        _id: null,
        rev: { $sum: '$totalAmount' },
      },
    },
  ]);

  const topProducts = await Order.aggregate([
    {
      $unwind: '$products',
    },
    {
      $group: {
        _id: '$products.product',
        quantity: { $sum: '$products.quantity' },
      },
    },
    {
      $addFields: { product: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { quantity: -1 },
    },
    {
      $limit: 3,
    },
  ]);

  await Promise.all(
    topProducts.map(async (el) => {
      el.product = await Product.findById(el.product);
    })
  );

  const lastMonthOrders = await Order.find({
    createdAt: { $gte: lastMonth, $lte: now },
  })
    .sort('-createdAt')
    .populate('user');

  res.locals.orders = lastMonthOrders;
  res.locals.topProducts = topProducts;
  res.locals.moment = moment;
  res.locals.newCustomers = newCustomers;
  res.locals.dailyRevenue = dailyRevenue[0] ? dailyRevenue[0].rev : 0;
  res.locals.dailyReviews = dailyReviews;
  res.locals.dailySignups = dailySignups;
  res.locals.dailyOrders = dailyOrders;

  res.render('admin/dashboard');
});

/////////////////////////////////////////////////////////////////////////////////////////
exports.chartDataDoughnut = catchAsync.other(async (req, res) => {
  const dataset1 = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $addFields: { category: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
  ]);

  await Promise.all(
    dataset1.map(async (el) => {
      el.category = await Category.findById(el.category)
        .select('name')
        .select('-_id');
    })
  );

  const categories = dataset1.map((el) => el.category.name);
  const productCount = dataset1.map((el) => el.count);

  const colors = [];
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  dataset1.forEach(() => colors.push(getRandomColor()));

  res.json({
    status: 'success',
    categories,
    productCount,
    colors,
  });
});

/////////////////////////////////////////////////////////////////////////////////////////
exports.chartDataDaily = catchAsync.other(async (req, res, next) => {
  const lastWeekDateString = getArrayOfDates(8, 'days', 'DD/MM').reverse();
  const lastWeekData = arrayOfStartEnd(8, 'days').reverse();
  const result = await Promise.all(
    lastWeekData.map(
      async (el) =>
        await Order.aggregate([
          {
            $match: { createdAt: { $gte: el.start, $lte: el.end } },
          },
          {
            $group: {
              _id: null,
              rev: { $sum: '$totalAmount' },
            },
          },
          {
            $project: { _id: 0 },
          },
        ])
    )
  );
  const finalData = result.map((el) => (el[0] ? el[0].rev : 0));

  res.json({
    status: 'success',
    finalData,
    lastWeekDateString,
  });
});

/////////////////////////////////////////////////////////////////////////////////////////
exports.chartDataWeekly = catchAsync.other(async (req, res, next) => {
  const last8WeekString = getArrayOfDates(12, 'weeks', 'wo').reverse();
  const lastWeeksData = arrayOfStartEnd(12, 'weeks').reverse();
  const result = await Promise.all(
    lastWeeksData.map(
      async (el) =>
        await Order.aggregate([
          {
            $match: { createdAt: { $gte: el.start, $lte: el.end } },
          },
          {
            $group: {
              _id: null,
              rev: { $sum: '$totalAmount' },
            },
          },
          {
            $project: { _id: 0 },
          },
        ])
    )
  );
  const finalData = result.map((el) => (el[0] ? el[0].rev : 0));

  res.json({
    status: 'success',
    finalData,
    last8WeekString,
  });
});

/////////////////////////////////////////////////////////////////////////////////////////
exports.chartDataMonthly = catchAsync.other(async (req, res, next) => {
  const thisYear = [];
  for (let i = 0; i < 12; ++i) {
    const thisYear1 = moment().startOf('year');
    const thisYear2 = moment().startOf('year');
    const newObj = {
      start: thisYear1.add(i, 'months').startOf('month').toDate(),
      end: thisYear2.add(i, 'months').endOf('month').toDate(),
    };
    thisYear.push(newObj);
  }
  const result = await Promise.all(
    thisYear.map(
      async (el) =>
        await Order.aggregate([
          {
            $match: { createdAt: { $gte: el.start, $lte: el.end } },
          },
          {
            $group: {
              _id: null,
              rev: { $sum: '$totalAmount' },
            },
          },
          {
            $project: { _id: 0 },
          },
        ])
    )
  );
  const finalData = result.map((el) => (el[0] ? el[0].rev : 0));

  res.json({
    status: 'success',
    finalData,
  });
});
//////////////////////////////////////////////////////////////////////////
function propertyMaker(orders, date) {
  const props = {
    // outputType: jsPDFInvoiceTemplate.OutputType.Save,
    returnJsPDFDocObject: true,
    fileName: 'Order-list',
    orientationLandscape: false,
    compress: true,
    logo: {
      src: '/images/logo.png',
      type: 'PNG', //optional, when src= data:uri (nodejs case)
      width: 53.33, //aspect ratio = width/height
      height: 26.66,
      margin: {
        top: 0, //negative or positive num, from the current position
        left: 0, //negative or positive num, from the current position
      },
    },
    business: {
      name: 'Greeny Inc',
      address: 'Albania, Tirane ish-Dogana, Durres 2001',
      phone: '(+91) 9191919191',
      email: 'support@greeny.com',
      website: 'www.greeny.com',
    },
    invoice: {
      label: 'Order List #:',
      num: orders.length,
      From: date.split('-')[0],
      To: date.split('-')[1],
      headerBorder: true,
      tableBodyBorder: true,
      header: [
        {
          title: '#',
          style: {
            width: 10,
          },
        },
        {
          title: 'Username',
          style: {
            width: 30,
          },
        },
        {
          title: 'Order ID',
          style: {
            width: 80,
          },
        },
        { title: 'Location' },
        { title: 'Date' },
        { title: 'Quantity' },
        { title: 'Total' },
      ],
      table: orders.map((order, index) => [
        index + 1,
        order.user.name,
        order.oid,
        order.state,
        new Date(order.createdAt).toLocaleDateString('en-IN'),
        order.products.length,
        orders.totalAmount,
      ]),
    },
    footer: {
      text: 'This order list is created on a computer.',
    },
    pageEnable: true,
    pageLabel: 'Page ',
  };
  return props;
}

//////////////////////////////////////////////////////////////////////////
exports.customOrders = catchAsync.other(async (req, res, next) => {
  const { date } = req.body;

  const startString = date.split(' - ')[0];
  const endString = date.split(' - ')[1];
  const momentStart = moment(startString, 'll');
  const momentEnd = moment(endString, 'll');
  const start = moment(momentStart).startOf('day').toDate();
  const end = moment(momentEnd).endOf('day').toDate();

  const orders = await Order.find({
    createdAt: { $gte: start, $lte: end },
  })
    .sort('-createdAt')
    .populate('user');

  const props = propertyMaker(orders, date);

  res.json({
    status: 'success',
    orders,
    props,
  });
});
