var requestHelpers = require('request-helpers');

module.exports = function(req, res, next) {
  requestHelpers.pickParams(['username'], req, function (error, params) {
    if (error) {
      return res.badRequest('missing_parameter', error);
    }

    sails.models.performer.count({username: params.username}, function (error, count) {
      if (error) {
        return res.serverError('database_error', error);
      }

      if (count < 1) {
        return res.badRequest('invalid_user', 'user doesn\'t exist');
      }

      next();
    });

  });
};
