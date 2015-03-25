module.exports = function (req, res, next) {

  if (typeof req.body === 'undefined') {
    req.query.user = req.session.user;

    return next();
  }

  req.body.user = req.session.user;

  next();
};
