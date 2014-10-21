module.exports = function(req, res, next) {
  var propertyName = 'user' === req.options.model ? 'id' : 'user',
      user = req.param(propertyName);

  if (['string', 'number'].indexOf(typeof user) > -1 && req.session.user.toString() === user) {
    return next();
  }

  return res.forbidden('You are not permitted to perform this action.');
};
