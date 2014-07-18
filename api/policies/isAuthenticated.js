module.exports = function(req, res, next) {

  // User is allowed, proceed to the next.
  if (req.session && req.session.user) {
    return next();
  }

  return res.forbidden('no_identity', 'You are not permitted to perform this action.');
};

