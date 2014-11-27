var request        = require('request'),
    extend         = require('extend'),
    bcrypt         = require('bcrypt'),
    requestHelpers = require('request-helpers'),
    UserController;

function subscribe (req, model, instance) {
  if (req.isSocket) {
    sails.models[model].subscribe(req, instance);
  }
}

function setupUserSession (req, result, role) {
  // Store user info in session.
  req.session.user = result.id;
  req.session.userInfo = {
    username         : result.username,
    roles            : result.roles,
    authenticatedRole: role,
    objectId         : result.object,
    email            : result.email
  };

  req.session.userInfo[role + 'Id'] = result[role].id;

  if ('visitor' === role && result.visitor.walletId) {
    req.session.userInfo.walletId = result.visitor.walletId;
  }

  if (req.isSocket) {
    sails.services.userservice.connect(result.id, req.socket);
  }

  subscribe(req, role, result[role]);
}

UserController = {
  getIdentity: function (req, res) {
    var query, role;

    query = sails.models.user.findOne({id: req.session.user});
    role  = req.param('role');

    if (role) {
      query.populate(role);
    }

    query.exec(function (error, user) {
      if (error) {
        return res.serverError('database_error', error);
      }

      if (!user) {
        req.session.user = null;

        return res.badRequest('no_indentity');
      }

      if (role) {
        if (!user[role]) {
          return res.badRequest('missing_role', role);
        }

        subscribe(req, role, user[role]);
      }

      res.ok(user);
    });
  },

  /**
   * @todo Document this
   * @todo Add support for authenticated users
   *
   * @param req
   * @param res
   */
  unsubscribe: function (req, res) {
    var hash = req.param('hash'),
        id = req.param('id'),
        userHash;

    sails.models.user.findOne(id, function (error, user) {
      if (error) {
        return res.serverError('database_error', error);
      }

      if (!user) {
        return res.badRequest('unknown_user');
      }

      userHash = sails.services.userservice.generateHash(user);

      if (userHash !== hash) {
        return res.badRequest('invalid_hash');
      }

      user.mailable = false;

      user.save(function (error) {
        if (error) {
          return res.serverError('database_error', error);
        }

        res.ok();
      });
    });
  },

  verify: function (req, res) {
    requestHelpers.pickParams(['id', 'type', 'hash'], req, function (error, params) {

      if (error) {
        return res.badRequest('missing_parameter', error);
      }

      var user = params.id,
          type = params.type,
          hash = params.hash;

      // findOne is safe because the "setter" of the email address will have verified the uniqueness.
      sails.models.user.findOne(user).exec(function (error, result) {
        if (error) {
          return res.negotiate(error);
        }

        if (!result) {
          return res.badRequest('invalid_hash'); // Deliberately wrong message to prevent email address scraping.
        }

        var field = type === 'email' ? 'email' : 'notificationEmail',
            generatedHash = sails.services.userservice.generateHash(result, 'verify.' + field);

        if (generatedHash !== hash) {
          return res.badRequest('invalid_hash ' + hash + ', ' + generatedHash);
        }

        var newValue = {};

        newValue[field + 'Verified'] = true;

        sails.models.user.update(result.id, newValue, function (error) {
          if (error) {
            return res.negotiate(error);
          }

          res.ok();
        });
      });
    });
  },

  /**
   * Get the username belonging to a userId
   *
   * @param req
   * @param res
   */
  getUsername: function (req, res) {
    sails.models.user.findOne(req.param('id')).exec(function (error, user) {

      if (error) {
        return res.serverError('database_error', error);
      }

      if (!user) {
        return res.badRequest('unknown_user');
      }

      res.ok({username: user.username});
    });
  },

  /**
   * Check if the desired username is still available.
   *
   * @param req
   * @param res
   */
  usernameAvailable: function (req, res) {
    if (!req.param('username')) {
      return res.badRequest('missing_parameter', 'username');
    }

    sails.services.userservice.usernameAvailable(req.param('username'), req.object.id, function (error, available) {
      if (error) {
        return res.serverError('server_error', error);
      }

      res.ok({available: available});
    });
  },

  /**
   * Login action.
   *
   * @param req
   * @param res
   */
  login: function (req, res) {

    var userModel = sails.models.user,
        walletService = sails.services.walletservice,
        requiredProperties,
        role,
        credentials,
        criteria;

    requiredProperties = [
      'role',
      'username',
      'password'
    ];

    requestHelpers.pickParams(requiredProperties, req, function (error, params) {

      // Verify that all required parameters have been supplied.
      if (error) {
        return res.badRequest('missing_parameter', error);
      }

      if (!userModel.isValidRole(params.role)) {
        return res.badRequest('invalid_parameter', 'role');
      }

      role = params.role;

      credentials = {
        username: params.username.trim(),
        password: params.password,
        object  : req.object.id,
        ip      : req.ip
      };

      criteria = {
        email: params.username.trim()
      };

      /**
       * Generic function for login, that checks the role and sets session data.
       *
       * @param {{}} result
       */
      function handleValidCredentials (result) {
        // Does the user have the role that is being authenticated for?
        if (result.roles.indexOf(role) === -1) {
          return res.badRequest('missing_role', role);
        }

        setupUserSession(req, result, role);

        // all done and authenticated.
        return res.ok(result);
      }

      // Fetch the user from the database.
      userModel.findOne(criteria).populate(role).exec(function (error, result) {

        // Something went wrong in the backend.
        if (error) {
          return res.serverError('database_error', error);
        }

        // No user found... Check if user has valid credentials with the wallet.
        if (!result) {

          return walletService.login(credentials, function (error, authenticated) {

            if (error) {
              return res.serverError('database_error', error);
            }

            // Nope. Alright then, invalid credentials.
            if (!authenticated) {
              return res.badRequest('invalid_credentials');
            }

            walletService.importUser(credentials, function (error, result) {
              if (error) {
                return res.serverError('database_error', error);
              }

              if (null === result) {
                // The following should never ever happen. It's not possible. But better safe than sorry.
                return res.serverError('database_error', {
                  error: 'Wallet auth success, but record not found in the wallet database.'
                });
              }

              // Simply rethrow, as we've just created the user. Prevents the existence of duplicate logic.
              UserController.login(req, res);
            });
          });
        }

        var afterPasswordValidate = function (passwordIsValid) {
          if (passwordIsValid) {

            // Credentials are valid! Execute remainder of validations.
            return handleValidCredentials(result);
          }

          // Does the user have the role that is being authenticated for?
          if (result.roles.indexOf(role) === -1) {
            return res.badRequest('missing_role', role);
          }

          // Only users with walletId are allowed to not have a password, because of import in hashLogin.
          // Otherwise, credentials were invalid for certain.
          if (!result[role].walletId) {
            return res.badRequest('invalid_credentials');
          }

          // Password is not empty, so it's not an imported user from hashLogin. Invalid credentials.
          if (result.password) {
            return res.badRequest('invalid_credentials');
          }

          // At this point, we know it's a wallet user, with no password (so imported on hashLogin).
          // We will now try to authenticate with the wallet, to see if the supplied credentials are correct.
          walletService.login(credentials, function (error, walletResult) {
            if (error) {
              return res.serverError('server_error', error);
            }

            // Nope, invalid credentials.
            if (!walletResult) {
              return res.badRequest('invalid_credentials');
            }

            // Update password for wallet user with the supplied, proven to be the valid, password.
            result.password = credentials.password;

            result.save(function (error) {
              if (error) {
                return res.serverError('database_error', error);
              }

              handleValidCredentials(result);
            });
          });
        };

        if (!result.password || !credentials.password) {
          return afterPasswordValidate(false);
        }

        // User record exists. Is supplied password correct?
        bcrypt.compare(credentials.password, result.password, function (error, passwordIsValid) {

          if (error) {
            return res.serverError('hashing_failed', error);
          }

          afterPasswordValidate(passwordIsValid);
        });
      });
    });
  },

  /**
   * Login by hash action.
   *
   * @param req
   * @param res
   */
  loginByHash: function (req, res) {

    var userModel = sails.models.user,
        walletService = sails.services.walletservice,
        requiredProperties,
        role,
        credentials,
        criteria;

    requiredProperties = [
      'role',
      'email',
      'hash',
      {required: false, param: 'username'}
    ];

    // Verify that all required parameters have been supplied.
    requestHelpers.pickParams(requiredProperties, req, function (error, params) {
      if (error) {
        return res.badRequest('missing_parameter', error);
      }

      if (!userModel.isValidRole(params.role)) {
        return res.badRequest('invalid_parameter', 'role');
      }

      role = params.role;

      credentials = {
        username: params.email.trim(),
        object  : req.object.id,
        ip      : req.ip
      };

      criteria = {
        email: params.email.trim()
      };

      if (params.username) {
        criteria['username'] = params.username;
      }

      /**
       * Authenticate.
       */
      userModel.findOne(criteria).populate(role).exec(function (error, result) {

        // Something went wrong in the backend.
        if (error) {
          return res.serverError('database_error', error);
        }

        // No user found by that email address.
        if (!result) {

          if (role === 'performer') {
            return res.badRequest('invalid_credentials');
          }

          // try to import user.
          return walletService.importUser(credentials, function (error, record) {
            if (error) {
              return res.serverError('server_error', error);
            }

            UserController.loginByHash(req, res);
          });
        }

        var hashService = sails.services.hashservice;

        // Check if the specified hash is correct.
        if (!hashService.verifyLoginHash(params.hash, credentials.username)) {

          // It's not. Invalid credentials.
          return res.badRequest('invalid_credentials');
        }

        // Does the supplied role exist?
        if (result.roles.indexOf(role) === -1) {
          return res.badRequest('missing_role', role);
        }

        setupUserSession(req, result, role);

        return res.ok(result);
      });
    });
  },

  /**
   * Logout action.
   * @param req
   * @param res
   */
  logout: function (req, res) {
    req.session.user = null;
    delete req.session.user;

    res.ok();
  },

  /**
   * Update password action
   * @param req
   * @param res
   */
  updatePassword: function (req, res){
    var userInfo = req.session.userInfo,
        requiredProperties = [
          'password',
          {required: false, param: 'skipWallet'}
        ];

    requestHelpers.pickParams(requiredProperties, req, function (error, params) {
      var password = params.password;

      sails.models.user.update(req.session.user, {password: password}, function (error, result) {
        var loginHash;

        if (error) {
          return res.negotiate(error);
        }

        if (!result) {
          return res.negotiate('unknown_user');
        }

        if ('visitor' !== userInfo.authenticatedRole || !userInfo.walletId || params.skipWallet) {
          return res.ok();
        }

        loginHash = sails.services.hashservice.generateLoginHash(userInfo.email);

        sails.services.walletservice.remoteChangePassword(userInfo.email, password, loginHash, function (error) {
            if (error) {
              return res.negotiate('server_error', error);
            }

            res.ok();
          }
        );
      });
    });
  }
};

module.exports = UserController;
