var requestHelpers = require('request-helpers');

module.exports = {
  create : function (req, res) {
    var query = {
      user    : req.session.user,
      username: req.param('username'),
    };

    sails.models.follow.findOrCreate(query, query, function (error, result) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok(result);
    });
  }
};
