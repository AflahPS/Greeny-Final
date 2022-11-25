exports.admin = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
    console.error(err);
    res.locals.user = req.session.user || null;
    res.locals.statusCode = 500;
    res.locals.message = 'Sorry, something went wrong!';
    res.render('admin/404');
  });
};

exports.user = (fn) =>
  function (req, res, next) {
    fn(req, res, next).catch((err) => {
      console.error(err);
      res.locals.user = req.session.user || null;
      res.locals.statusCode = 500;
      res.locals.message = 'Sorry, something went wrong!';
      res.render('user/error');
    });
  };

exports.other = (fn) =>
  function (req, res, next) {
    fn(req, res, next).catch((err) => {
      console.error(err.message, err.name);
      res.locals.user = req.session.user || null;
      res.locals.message = err.message;
      // Handling Cast errors from mongo
      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'failed',
          message: `Invalid ${err.path}: ${err.value}`,
        });
      }
      // Handling Cast errors from mongo
      if (err.code === 11000) {
        const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
        return res.json({
          status: 'failed',
          message: `Duplicate value: ${value}: please try another value!`,
        });
      }
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el) => el.message);
        return res.json({
          status: 'failed',
          message: `Invalid input: ${errors.join('. ')}`,
        });
      }
      res.json({ status: 'failed', message: err.message });
    });
  };
