var request = require('request')
  , extend = require('extend');

module.exports = {

  getIdentity: function (req, res) {
    if (!req.session || !req.session.user) {
      return res.json({
        success: false,
        message: 'No identity'
      });
    }

    sails.models['user'].findOne({id: req.session.user}).exec(function(error, user) {
      if (error) {
        return res.json({
          success: false,
          message: 'error',
          error: error
        });
      }

      res.json({
        success: true,
        what: req.session.whattt,
        data: user
      });

    });
  },

  getUsername: function(req, res) {
    sails.models['user'].findOne(req.param('id')).exec(function(error, user) {
      if (error) {
        return res.json({
          error: 'Server error'
        });
      }

      if (!user) {
        return res.json({
          error: 'User not found'
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
      return res.json({
        error: 'Invalid credentials'
      });
    }

    /**
     * Handle authentication errors.
     *
     * @param {String|Error} error
     */
    function authenticationError(error) {
      console.error('Error fetching user.', error);

      return res.json({
        error: 'Authentication error'
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
    sails.models.user.findOne(credentialsEmail).exec(function (error, result) {

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
