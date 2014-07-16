var request = require('request')
  , extend = require('extend')
  , UserController;

UserController = {
  getIdentity: function (req, res) {
    var query, role;

    if (!req.session || !req.session.user) {
      return res.badRequest('no_identity');
    }

    query = sails.models['user'].findOne({id: req.session.user});

    if (role = req.param('role')) {
      query.populate(role);
    }

    query.exec(function (error, user) {
      if (error) {
        return res.badRequest('database_error');
      }

      sails.models[role].subscribe(req, user[role]);

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
    sails.models['user'].findOne(req.param('id')).exec(function (error, user) {

      if (error) {
        return res.badRequest('database_error');
      }

      if (!user) {
        return res.badRequest('no_identity');
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

    var userModel = sails.models['user']
      , role
      , credentials
      , credentialsEmail;

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

    credentialsEmail = {
      email   : req.body.username,
      password: req.body.password
    };

    /**
     * Authenticate.
     *
     * @todo Switch to findOne by username only, and match the passwords later on (because of bcrypt).
     */
    userModel.findOne(credentialsEmail).populate(role).exec(function (error, result) {

      // Something went wrong in the backend.
      if (error) {
        return res.badRequest('database_error');
      }

      // Does the supplied role exist?
      if (result.roles.indexOf(role) === -1) {
        return res.badRequest('missing_role', role);
      }

      // We got data! Success, user logged in.
      if (typeof result !== 'undefined') {
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

      // Fallback. If possible, import user from wallet. Otherwise, screw it.
      sails.services['walletservice'].login(credentials, function (error, record) {

        if (error) {
          return res.badRequest('database_error');
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
