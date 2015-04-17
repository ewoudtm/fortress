var request = require('request'),
    apiUrl  = sails.config.camspotter.apiUrl;

module.exports = {
  request : function (action, parameters, callback) {
    request.get(apiUrl + action, {qs: parameters}, function (error, response, body) {
      var responseData;

      if (error) {
        return callback(error);
      }

      try {
        responseData = JSON.parse(body);
        callback(null, responseData);
      } catch (error) {
        callback(error);
      }
    });
  },

  changeEmail : function (oldEmail, newEmail, callback, force) {
    var self   = this,
        params = {
          email    : oldEmail,
          new_email: newEmail
        };

    // merge existing rows that fall under newEmail
    if (typeof force !== undefined && force !== false) {
      params.force = true;
    }

    self.request('change_email', params, function (error, response) {
      if (error) {
        return callback(error);
      }

      if (response === 'ok') {
        return callback(null, true);
      }

      // error could be hiding in the response
      callback(null, {error: response});
    });
  },

  subscribe : function (req, res, callback) {
    var self        = this,
        siteUrl     = req.param('url'),
        followQuery = {
          id: req.param('id')
        },
        userQuery   = {
          id: req.session.user
        };

    sails.models.follow.findOne(followQuery, function (error, followIdentity) {
      if (error) {
        return res.serverError('database_error', error);
      }

      if (!followIdentity) {
        return res.badRequest('invalid_id');
      }

      sails.models.user.findOne(userQuery, function (error, userIdentity) {
        if (error) {
          return res.serverError('database_error', error);
        }

        if (!userIdentity) {
          return res.badRequest('unknown_user');
        }

        var subscribeStatus = !!req.param('mail'),
            action          = subscribeStatus ? 'opt_in' : 'opt_out',
            params          = {
              email       : userIdentity.notificationEmailVerified ? userIdentity.notificationEmail : userIdentity.email,
              performer   : followIdentity.username,
              partner     : userIdentity.partnerCode,
              info        : userIdentity.partnerInfo,
              preventMail : true,
              redirect    : false,
              confirmEmail: true,
              url         : siteUrl
            };

        if (!subscribeStatus) {
          // force opt_out without checking the hash parameter
          params.force = true;
          params.hash  = 'dummy';
        }

        self.request(action, params, function (error, response) {
          if (error) {
            return callback(error);
          }

          // error could be hiding in the response
          if (response === 'ok') {
            return callback(null, true);
          }

          callback(null, {error: response});
        });
      });
    });
  }
};
