var request = require('request')
  , extend = require('extend')
  , UserController;

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

      if (role) {
        if (!user[role]) {
          return res.badRequest('missing_role', role);
        }

        sails.models[role].subscribe(req, user[role]);
      }

      res.ok(user);
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

      return res.ok({username: user.username});
    });
  },

  /**
   * Login action.
   *
   * @param req
   * @param res
   */
  login: function (req, res) {

    var userModel = sails.models.user
      , role
      , credentials
      , criteria;

    if (!req.body.role) {
      return res.badRequest('missing_parameter', 'role');
    }

    if (!req.body.username) {
      return res.badRequest('missing_parameter', 'username');
    }

    if (!req.body.password) {
      return res.badRequest('missing_parameter', 'password');
    }

    if (!userModel.isValidRole(req.body.role)) {
      return res.badRequest('invalid_parameter', 'role');
    }

    role = req.body.role;

    credentials = {
      username: req.body.username,
      password: req.body.password
    };

    criteria = {
      email: req.body.username
    };

    /**
     * Authenticate.
     */
    userModel.findOne(criteria).populate(role).exec(function (error, result) {

      // Something went wrong in the backend.
      if (error) {
        return res.serverError('database_error', error);
      }

      // We got data!
      if (typeof result !== 'undefined') {

        // Do the passwords match? Check is here, so now we won't import from the wallet.
        // @todo implement bcrypt
        if (credentials.password === result.password) {

          // Does the supplied role exist?
          if (result.roles.indexOf(role) === -1) {
            return res.badRequest('missing_role', role);
          }

          req.session.user = result.id;
          req.session.userInfo = {
            username: result.username,
            roles   : result.roles
          };

          req.session.userInfo[role + 'Id'] = result[role].id;

          if (req.isSocket) {
            sails.models[role].subscribe(req, result[role]);
          }

          return res.ok(result);
        }

        if (null !== result.password && 0 !== result[role].walletId) {
          return res.badRequest('invalid_credentials');
        }

        // Match wallet credentials
        sails.services['walletservice'].login(credentials, function (error, record) {
          if (error) {
            return res.serverError('database_error', error);
          }

          if (!record) {
            return res.badRequest('invalid_credentials');
          }

          // Update empty password with given password.
          sails.models['user'].update({email: credentials.username, password: null}, {password: credentials.password}).exec(function (error, updated) {
            if (error) {
              return res.serverError('database_error', error);
            }

            UserController.login(req, res);
          });
        });

        return;
      }

      // Fallback. If possible, import user from wallet. Otherwise, screw it.
      sails.services['walletservice'].login(credentials, function (error, record) {

        if (error) {
          return res.serverError('database_error', error);
        }

        if (!record) {
          return res.badRequest('invalid_credentials');
        }

        // Simply rethrow, as we've just created the user. Prevents the existence of duplicate logic.
        UserController.login(req, res);
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

    var userModel = sails.models['user']
      , role
      , credentials
      , criteria;

    if (!req.body.role) {
      return res.badRequest('missing_parameter', 'role');
    }

    if (!req.body.username) {
      return res.badRequest('missing_parameter', 'username');
    }

    if (!req.body.hash) {
      return res.badRequest('missing_parameter', 'hash');
    }

    if (!userModel.isValidRole(req.body.role)) {
      return res.badRequest('invalid_parameter', 'role');
    }

    role = req.body.role;

    credentials = {
      username: req.body.username,
    };

    criteria = {
      email: req.body.username
    };

    /**
     * Authenticate.
     */
    userModel.findOne(criteria).populate(role).exec(function (error, result) {

      // Something went wrong in the backend.
      if (error) {
        return res.serverError('database_error', error);
      }

      var hashService  = sails.services['hashservice']
        , validateHash = hashService.verifyLoginHash(req.body.hash, credentials.username)

      if (false === validateHash) {
        return res.badRequest('invalid_credentials');
      }

      // We got data!
      if (typeof result !== 'undefined') {

        // Does the supplied role exist?
        if (result.roles.indexOf(role) === -1) {
          return res.badRequest('missing_role', role);
        }

        req.session.user     = result.id;
        req.session.userInfo = {
          username: result.username,
          roles   : result.roles
        };

        req.session.userInfo[role + 'Id'] = result[role].id;

        if (req.isSocket) {
          sails.models[role].subscribe(req, result[role]);
        }

        return res.ok(result);
      }

      // Fallback. No user found but hash validates, import user without a password.
      sails.services['walletservice'].importUser(credentials, function (error, record) {
        if (error) {
          return res.serverError('database_error', error);
        }

        req.session.user     = record.id;
        req.session.userInfo = {
          username: record.username,
          roles   : record.roles
        };

        req.session.userInfo[role + 'Id'] = record[role].id;

        if (req.isSocket) {
          sails.models[role].subscribe(req, record[role]);
        }

        return res.ok(record);
      });
    });
  },

  /**
   * Logout action.
   *
   * @param req
   * @param res
   * @todo fix logout over socket.
   */
  logout: function (req, res) {
    req.session.user = null;
    delete req.session.user;

    res.ok();
  }
};

module.exports = UserController;
