exports.admin = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
    console.log(err);
    res.locals.user = req.session.user || null;
    res.locals.message = err.message;
    res.render('admin/404');
  });
};

exports.user = (fn) =>
  function (req, res, next) {
    fn(req, res, next).catch((err) => {
      console.log(err);
      res.locals.user = req.session.user || null;
      res.locals.message = err.message;
      res.render('user/error');
    });
  };

exports.other = (fn) =>
  function (req, res, next) {
    fn(req, res, next).catch((err) => {
      console.log(err);
      res.locals.user = req.session.user || null;
      res.locals.message = err.message;
      res.json({ status: 'failed', message: err.message });
    });
  };
