var request = require('request'),
    apiUrl  = sails.config.camspotter.apiUrl;

module.exports = {

  request : function (subscribe, parameters, callback) {
    var action = subscribe ? 'opt_in' : 'opt_out';

    if (!subscribe) {
      // force opt_out without checking the hash parameter
      parameters.force = true;
      parameters.hash  = 'dummy';
    }

    request.get(apiUrl + action, {qs: parameters}, function (error, response, body) {
      var responseData;

      if (error) {
        return callback(error);
      }

      try {
        responseData = JSON.parse(body);

        switch (responseData) {
          case 'ok':
          case 'exists':
          case 'confirm':
            return callback(null, responseData);
        }

        return callback(responseData);

      } catch (error) {
        return callback(error);
      }
    });
  },

  resolve : function (req, res, callback) {
    var self      = this,
        siteUrl   = req.param('url'),
        followQuery = {
          id: req.param('id')
        },
        userQuery = {
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

        var params = {
              email       : userIdentity.notificationEmailVerified ? userIdentity.notificationEmail : userIdentity.email,
              performer   : followIdentity.username,
              partner     : userIdentity.partnerCode,
              info        : userIdentity.partnerInfo,
              preventMail : true,
              redirect    : false,
              confirmEmail: true,
              url         : siteUrl
            };

        self.request(!!req.param('mail'), params, callback);
      });
    });
  }
};
