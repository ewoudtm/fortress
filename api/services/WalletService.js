var request = require('request');

module.exports = {

  importUser: function (credentials, callback) {
    var queryUser = credentials.username;

    if (credentials.email) {
      queryUser = credentials.email;
    }

    sails.services.objectconfigservice.initConfig(credentials.object, function (error, objectConfig) {
      if (error) {
        return callback(error);
      }

      var programId = objectConfig.resolve('wallet.programId');

      sails.models.wallet.findUser(programId, queryUser, function (error, user) {
        if (error) {
          return callback(error);
        }

        if (!user) {
          sails.log.warn(
            'WalletService.importUser() could not find requested user in wallet DB. \n' +
            'Did you perhaps forget to change `sails.config.wallet.apiUrl`? ' +
            'Or the connection config for chatterbox? The environments have to match!'
          );

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
    });
  },

  getWalletApiUrl: function (object, callback) {
    var apiUrl = sails.config.wallet.apiUrl;

    if (typeof object === 'function') {
      callback = object;
      object = false;
    }

    if (!object) {
      return callback(null, apiUrl);
    }

    sails.services.objectconfigservice.initConfig(object, function (error, objectConfig) {
      if (error && error.error === 'unknown_object') {
        return callback(null, apiUrl);
      }

      callback(error, objectConfig.resolve('wallet.apiUrl', apiUrl));
    });
  },

  request: function (action, parameters, callback, method, object) {
    method = method || 'post';

    if (typeof parameters === 'function') {
      callback = parameters;
      parameters = {};
    }

    this.getWalletApiUrl(object, function (error, apiUrl) {
      if (error) {
        return callback(error);
      }

      if (typeof parameters.form === 'object') {
        parameters.form.action = action;
      } else if (typeof parameters.qs === 'object') {
        parameters.qs.action = action;

        if (typeof parameters.qs.from_url === 'undefined') {
          parameters.qs.from_url = apiUrl.replace(/\/ajax\/wallet/, '\/');
        }
      } else {
        return callback({error: 'invalid parameters for request'});
      }

      request[method](apiUrl, parameters, function (error, response, body) {
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
    });
  },

  register: function (credentials, callback) {
    var walletAccount = _.clone(credentials),
        self = this;

    walletAccount.termsAgreed = 1;
    walletAccount.username = walletAccount.email;

    delete walletAccount.email;
    delete walletAccount.object;

    this.request('register', {qs: walletAccount}, function (error, response) {
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
        } else if (walletError.code === 'password_not_valid') {
          errorType = walletAccount.password.length < 5 ? 'minLength' : 'maxLength';
          errorAttribute = 'password';
        }

        if (errorType) {
          errorObject = {
            error            : 'E_VALIDATION',
            model            : 'User',
            invalidAttributes: {}
          };

          errorObject.invalidAttributes[errorAttribute] = [{rule: errorType}];
        } else {
          errorObject = {
            error: 'unknown_error'
          };

          sails.log.error(walletError);
        }

        return callback(errorObject);
      }

      if (!response.ok) {
        return callback(null, false);
      }

      self.importUser(credentials, callback);
    }, 'get', credentials.object);
  },

  login: function (credentials, callback) {
    this.request('login', {form: credentials}, function (error, response) {
      if (error) {
        return callback(error);
      }
      callback(null, !!response.ok);
    }, 'post', credentials.object);
  },

  /**
   * @param {*}         object
   * @param {string}    email
   * @param {string}    password
   * @param {Function}  callback
   */
  changePassword: function (object, email, password, callback) {
    this.request('remoteChangePassword', {
      form: {
        email   : email,
        password: password,
        token   : sails.services.hashservice.generateLoginHash(email)
      }
    }, function (error, response) {
      if (error) {
        return callback(error);
      }

      callback(null, !!response.ok);
    }, 'post', object);
  },

  delete: function (walletId, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    const wallet = Wallet.findOne({id: walletId})
      .then((wallet) => {
        if (wallet === {} || wallet === undefined || wallet === null) { return callback(null, false) };
        Wallet.destroy(wallet)
        .then(() => {return callback(null, true) })
        .catch((err) => { return callback(err, false) })
      })
      .catch((err) => { return callback(err, false) })
  }  

};
