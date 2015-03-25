var requestHelpers = require('request-helpers');

module.exports = function(req, res, next) {
  var username = req.param('username');

  if (username.length < 1) {
    return res.badRequest('missing_parameter', 'username');
  }

  sails.models.performer.count({username: username}, function (error, count) {
    if (error) {
      return res.serverError('database_error', error);
    }

    if (count < 1) {
      return res.badRequest('invalid_user', 'user doesn\'t exist');
    }

    next();
  });
};
