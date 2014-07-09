var request = require('request')
  , extend = require('extend');

module.exports = {

  getIdentity: function (req, res) {
    if (!req.session || !req.session.user) {
      var errorResponse = new Error();
      errorResponse.name = 'no_identity';
      errorResponse.message = 'No identity';

      return res.json({
        error: errorResponse
      });
    }

    sails.models['user'].findOne({id: req.session.user}).populateAll().exec(function(error, user) {
      if (error) {
        var errorResponse = new Error();
        errorResponse.name = 'database_error';
        errorResponse.message = 'Something went wrong while fetching the identity.';

        return res.json({
          error: errorResponse
        });
      }

      res.json(user);
    });
  },

  getUsername: function(req, res) {
    sails.models['user'].findOne(req.param('id')).exec(function(error, user) {
      var errorResponse;

      if (error) {
        errorResponse = new Error();
        errorResponse.name = 'database_error';
        errorResponse.message = 'Something went wrong while fetching the identity.';

        return res.json({
          error: errorResponse
        });
      }

      if (!user) {
        errorResponse = new Error();
        errorResponse.name = 'no_identity';
        errorResponse.message = 'No identity';

        return res.json({
          error: errorResponse
        });
      }

      return res.json({username: user.username});
    });
  },

  /**
   * Login action.
   *
   * @param req
   * @param res
   */
  login: function (req, res) {

    /**
     * @type {{username: {String}, password: {String}}}
     */
    var credentials = {
        username: req.body.username,
        password: req.body.password
      }
      , credentialsEmail = {
        email: req.body.username,
        password: req.body.password
      };

    /**
     * Handle invalid credentials.
     */
    function invalidCredentials() {
      var errorResponse = new Error();
      errorResponse.name = 'invalid_credentials';
      errorResponse.message = 'Invalid credentials supplied';

      return res.json({
        error: errorResponse
      });
    }

    /**
     * Handle authentication errors.
     *
     * @param {String|Error} error
     */
    function authenticationError(error) {
      var errorResponse = new Error();
      errorResponse.name = 'database_error';
      errorResponse.message = 'Something went wrong while fetching the identity.';

      return res.json({
        error: errorResponse
      });
    }

    /**
     * Handle successful authentication.
     *
     * @param {User} result
     */
    function userAuthenticated(result) {
      req.session.user = result.id;

      return res.json(result);
    }

    /**
     * Authenticate.
     *
     * @todo Switch to findOne by username only, and match the passwords later on (because of bcrypt).
     */
    sails.models.user.findOne(credentialsEmail).populateAll().exec(function (error, result) {

      if (error) {
        return authenticationError(error);
      }

      if (typeof result !== 'undefined') {
        return userAuthenticated(result);
      }

      sails.services['walletservice'].login(credentials, function (error, record) {

        if (error) {
          return authenticationError(error);
        }

        if (!record) {
          return invalidCredentials();
        }

        userAuthenticated(record);
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

    res.json({
      success: true,
      message: 'Logged out successfully!'
    });
  }
};
