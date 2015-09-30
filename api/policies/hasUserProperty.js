module.exports = function(req, res, next) {
  if (!req.param('user')) {
    return res.badRequest('missing_parameter', 'user');
  }

  next();
};
