var applicableRoutes = ['/visitor/identity', '/visitor/username'];

module.exports = function(req, res, next) {

  if (applicableRoutes.indexOf(req.route.path) === -1) {
    return next();
  }

  req.options.user = req.session.user;

  next();
};
