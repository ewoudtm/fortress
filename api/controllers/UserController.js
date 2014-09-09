var request = require('request'),
    extend  = require('extend'),
    bcrypt  = require('bcrypt'),
    UserController;

function subscribe (req, model, instance) {
  if (req.isSocket) {
    sails.models[model].subscribe(req, instance);
  }
}

UserController = {
  getIdentity: function (req, res) {
    var query, role;

    query = sails.models.user.findOne({id: req.session.user});
    role = req.param('role');

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
   * @todo Build the thing where I tell mysecurewallet to send an email (on new message).
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
        role,
        credentials,
        criteria;

    // Verify that all required parameters have been supplied.
    if (!req.param('role')) {
      return res.badRequest('missing_parameter', 'role');
    }

    if (!req.param('username')) {
      return res.badRequest('missing_parameter', 'username');
    }

    if (!req.param('password')) {
      return res.badRequest('missing_parameter', 'password');
    }

    if (!userModel.isValidRole(req.param('role'))) {
      return res.badRequest('invalid_parameter', 'role');
    }

    role = req.param('role');

    credentials = {
      username: req.param('username'),
      password: req.param('password'),
      object  : req.object.id,
      ip      : req.ip
    };

    criteria = {
      email: req.param('username')
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

      // Store user info in session.
      req.session.user = result.id;
      req.session.userInfo = {
        username         : result.username,
        roles            : result.roles,
        authenticatedRole: role
      };

      req.session.userInfo[role + 'Id'] = result[role].id;

      if ('visitor' === role && result.visitor.walletId) {
        req.session.userInfo.walletId = result.visitor.walletId;
      }

      // Subscribe to events.
      subscribe(req, role, result[role]);

      // all done and authenticated.
      return res.ok(result);
    }

    // Fetch the user from the database.
    userModel.findOne(criteria).populate(role).exec(function (error, result) {

      // Something went wrong in the backend.
      if (error) {
        return res.serverError('database_error', error);
      }

      // No user found... Check if user has to be imported from the wallet.
      if (!result) {

        return sails.services.walletservice.login(credentials, function (error, record) {

          if (error) {
            return res.serverError('database_error', error);
          }

          // Nope. Alright then, invalid credentials.
          if (!record) {
            return res.badRequest('invalid_credentials');
          }

          // Simply rethrow, as we've just created the user. Prevents the existence of duplicate logic.
          UserController.login(req, res);
        });
      }

      // User record exists. Is supplied password correct?
      bcrypt.compare(credentials.password, result.password, function (error, passwordIsValid) {

        if (error) {
          return res.serverError('hashing_failed', error);
        }

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
        sails.services.walletservice.login(credentials, function (error, result) {
          if (error) {
            return res.serverError('server_error', error);
          }

          // Nope, invalid credentials.
          if (!result) {
            return res.badRequest('invalid_credentials');
          }

          // Update password for wallet user with the supplied, proven to be the valid, password.
          sails.models.user.update({
            email   : credentials.username,
            password: null
          }, {password: credentials.password}).exec(function (error) {
            if (error) {
              return res.serverError('database_error', error);
            }

            handleValidCredentials(result);
          });
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
        role,
        credentials,
        criteria;

    // Verify that all required parameters have been supplied.
    if (!req.param('role')) {
      return res.badRequest('missing_parameter', 'role');
    }

    if (!req.param('email')) {
      return res.badRequest('missing_parameter', 'email');
    }

    if (!req.param('hash')) {
      return res.badRequest('missing_parameter', 'hash');
    }

    if (!userModel.isValidRole(req.param('role'))) {
      return res.badRequest('invalid_parameter', 'role');
    }

    role = req.param('role');

    credentials = {
      username: req.param('email'),
      object  : req.object.id,
      ip      : req.ip
    };

    criteria = {
      email: req.param('email')
    };

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

        // try to import user.
        return sails.services.walletservice.importUser(credentials, function (error, record) {
          if (error) {
            return res.serverError('server_error', error);
          }

          if (!record) {
            return res.badRequest('invalid_credentials');
          }

          UserController.loginByHash(req, res);
        });
      }

      var hashService = sails.services.hashservice;

      // Check if the specified hash is correct.
      if (!hashService.verifyLoginHash(req.param('hash'), credentials.username)) {

        // It's not. Invalid credentials.
        return res.badRequest('invalid_credentials');
      }

      // Does the supplied role exist?
      if (result.roles.indexOf(role) === -1) {
        return res.badRequest('missing_role', role);
      }

      req.session.user = result.id;
      req.session.userInfo = {
        username         : result.username,
        roles            : result.roles,
        authenticatedRole: role
      };

      req.session.userInfo[role + 'Id'] = result[role].id;

      if ('visitor' === role && result.visitor.walletId) {
        req.session.userInfo.walletId = result.visitor.walletId;
      }

      subscribe(req, role, result[role]);

      return res.ok(result);
    });
  },

  /**
   * Logout action.
   * @todo fix logout over socket.
   * @param req
   * @param res
   */
  logout: function (req, res) {
    req.session.user = null;
    delete req.session.user;

    res.ok();
  }
};

module.exports = UserController;
