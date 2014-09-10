var request = require('request'),
    extend  = require('extend');

module.exports = {

  importUser: function (credentials, callback) {

    var queryUser = credentials.username;

    if (credentials.email) {
      queryUser = credentials.email;
    }

    sails.models.wallet.findUser(queryUser, function (error, user) {
      if (error) {
        return callback(error);
      }

      if (!user) {
        return callback(null, null);
      }

      var newVisitorValues = {
        walletId: user.id,
        credits : user.credits
      }, newUserValues = {
        ip           : credentials.ip,
        email        : credentials.username,
        emailVerified: !!user.email_verified,
        partnerInfo  : user.reg_promotor_info || null,
        partnerCode  : user.partner_code || null,
        object       : credentials.object,
        password     : credentials.password || null, // @see UserController.loginByHash
        visitor      : newVisitorValues
      };

      if (credentials.email && credentials.username) {
        newUserValues.email = credentials.email;
        newUserValues.username = credentials.username;
        newUserValues.object = credentials.object;
        newVisitorValues.username = credentials.username;
      }

      sails.models.user.register(newUserValues, function (error, newUser) {
        if (error) {
          return callback(error);
        }

        callback(null, newUser);
      });
    });
  },

  /**
   * @param {{}}       from     Populated user object
   * @param {{}}       to       Populated user object
   * @param {Function} callback
   */
  sendNotification: function (from, to, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    if (typeof to.visitor !== 'object') {
      return callback({
        error      : 'invalid_argument',
        description: 'Expected a populated user entity.'
      });
    }

    var visitor = to.visitor,
        notificationData = {
          hash     : sails.services.userservice.generateHash(to),
          wallet_id: visitor.walletId,
          user_id  : to.id,
          performer: from.username
        };

    this.request('notification', {qs: notificationData}, function (error, response) {
      if (error) {
        return callback(error);
      }

      callback(null);
    }, 'get');
  },

  request: function (action, parameters, callback, method) {
    method = method || 'post';

    var walletUrl = sails.config.wallet.walletAPIUrl;

    if (typeof parameters === 'function') {
      callback = parameters;
      parameters = {};
    }

    if (parameters.form) {
      parameters.form.action = action;
    } else {
      parameters.qs.action = action;
    }

    request[method](walletUrl, parameters, function (error, response, body) {
      var responseData;

      if (error) {
        return callback(error);
      }

      try {
        responseData = JSON.parse(body);
      } catch (error) {
        return callback(error);
      }

      callback(null, responseData);
    });
  },

  register: function (credentials, callback) {
    var walletAccount = _.clone(credentials),
        self = this;

    walletAccount.termsAgreed = 1;
    walletAccount.username = walletAccount.email;

    delete walletAccount.email;
    delete walletAccount.object;

    this.request('register', {form: walletAccount}, function (error, response) {
      if (error) {
        return callback(error);
      }

      /**
       * Sorry for this. It's a bit of logic to "purify" what the wallet returns.
       * Errors get converted to the format sails uses.
       */
      if (response.errors.length) {
        var walletError = response.errors[0],
            errorType,
            errorAttribute,
            errorObject;

        if (walletError.code === 'account_exists') {
          return callback(null, false);
        }

        if (walletError.code === 'email_not_valid') {
          errorType = 'email';
          errorAttribute = errorType;
        } else {
          errorType = walletAccount.password.length < 5 ? 'minLength' : 'maxLength';
          errorAttribute = 'password';
        }

        errorObject = {
          error            : 'E_VALIDATION',
          model            : 'User',
          invalidAttributes: {}
        };

        errorObject.invalidAttributes[errorAttribute] = [{rule: errorType}];

        return callback(errorObject);
      }

      if (!response.ok) {
        return callback(null, false);
      }

      self.importUser(credentials, callback);
    });
  },

  login: function (credentials, callback) {
    this.request('login', {form: credentials}, function (error, response) {
      if (error) {
        return callback(error);
      }

      callback(null, !!response.ok);
    });
  }
};
