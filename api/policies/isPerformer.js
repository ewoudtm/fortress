module.exports = function(req, res, next) {

  // User is allowed, proceed to the next.
  if (req.session.userInfo.roles.indexOf('performer') > -1) {
    return next();
  }

  return res.forbidden('You are not permitted to perform this action.');
};
