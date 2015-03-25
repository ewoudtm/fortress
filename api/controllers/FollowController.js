var requestHelpers = require('request-helpers'),
    FollowController;

function validatePerformerName (name, callback) {
  sails.models.performer.count({username: name}, function (error, count) {
    if (error) {
      return callback(error);
    }

    return callback(null, !!count);
  });
}

FollowController = {
  create : function (req, res) {
    requestHelpers.pickParams(['username'], req, function (error, params) {
      if (error) {
        return res.badRequest('missing_parameter', error);
      }

      var performer = params.username,
          user      = req.body.user,
          query     = {
            user    : user,
            username: performer
          }

      validatePerformerName(performer, function (error, isValid) {
        if (error) {
          return res.serverError('database_error', error);
        }

        if (!isValid) {
          return res.badRequest('invalid_user', 'user doesn\'t exist');
        }

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
      });
    });
  },

  find : function (req, res) {
    requestHelpers.pickParams([{required: false, param: 'username'}], req, function (error, params) {
      var performer = params.username,
          user      = req.query.user,
          query     = {
            user: user
          };

      if (null !== performer) {
        query.username = performer;
      }

      sails.models.follow.find(query, function (error, result) {
        if (error) {
          return res.serverError('database_error', error);
        }

        res.ok(result);
      });
    });
  },

  destroy : function (req, res) {
    requestHelpers.pickParams(['username'], req, function (error, params) {
      if (error) {
        return res.badRequest('missing_parameter', error);
      }

      var performer = params.username,
          user      = req.body.user,
          query     = {
            user    : user,
            username: performer
          }

      sails.models.follow.destroy(query, function (error) {
        if (error) {
          return res.serverError('database_error', error);
        }

        res.ok();
      });
    });
  }
};

module.exports = FollowController;
