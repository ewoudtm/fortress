var requestHelpers = require('request-helpers');

module.exports = {
  create : function (req, res) {
    var query = {
      user    : req.session.user,
      username: req.body.username,
    };

    sails.models.follow.count(query, function (error, count) {
      if (error) {
        return res.serverError('database_error', error);
      }

      // user is already following this performer
      if (count > 0) {
        return res.ok();
      }

      sails.models.follow.create(query, function (error, result) {
        if (error) {
          return res.serverError('database_error', error);
        }

        res.ok();
      });
    });
  }
};
