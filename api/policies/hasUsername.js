/**
 * Set to find where to = authenticated user's id, or from = authenticated user's id.
 */
module.exports = function(req, res, next) {
  if (req.session.userInfo && req.session.userInfo.username) {
    return next();
  }

  res.badRequest('missing_username', 'A username is required for this feature.');
};
