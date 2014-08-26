var request = require('request'),
    extend  = require('extend');

module.exports = {

  importUser: function (credentials, callback) {

    sails.models.wallet.findUser(credentials.username, function (error, user) {
      if (error) {
        return callback(error);
      }

      if (!user) {
        return callback(null, null);
      }

      var newVisitorValues = {
        walletId   : user.id,
        credits    : user.credits,
        partnerInfo: user.reg_promotor_info,
        partnerCode: user.partner_code
      }, newUserValues = {
        email        : credentials.username,
        emailVerified: !!user.email_verified,
        password     : credentials.password || null, // @see UserController.loginByHash
        visitor      : newVisitorValues
      };

      sails.models.user.register(newUserValues, function (error, newUser) {
        if (error) {
          return callback(error);
        }

        callback(null, newUser);
      });
    });
  },

  login: function (credentials, callback) {
    var walletUrl = sails.config.userSync.backupAuthenticationUrl,
        self = this;

    request.post(walletUrl, {form: extend({action: 'login'}, credentials)}, function (error, response, body) {
      var responseData;

      if (error) {
        return callback(error);
      }

      try {
        responseData = JSON.parse(body);
      } catch (error) {
        return callback(error);
      }

      if (!responseData.ok) {
        return callback(null, false);
      }

      self.importUser(credentials, callback);
    });
  }
};
