var requestHelpers = require('request-helpers');

module.exports = {
  setUsername: function (req, res) {
    if (!req.body.username) {
      return res.badRequest('missing_parameter', 'username');
    }

    sails.services.userservice.usernameAvailable(req.body.username, req.object.id, function (error, available) {
      if (error) {
        return res.serverError('server_error', error);
      }

      if (!available) {
        return res.badRequest('username_exists', req.body.username);
      }

      sails.models.user.update(req.session.user, {username: req.body.username}).exec(function (error) {
        if (error) {
          var invalid = error.invalidAttributes;

          if (invalid && invalid.username && invalid.username[0].rule === 'regex') {
            return res.badRequest('invalid_parameter', 'username');
          }

          return res.serverError('database_error', error);
        }

        sails.models.visitor.update(req.session.userInfo.visitorId, {username: req.body.username}).exec(function (error) {
          if (error) {
            return res.serverError('database_error', error);
          }

          req.session.userInfo.username = req.body.username;

          res.ok();
        });
      });
    });
  },

  register: function (req, res) {

    var requiredProperties = [
      'username',
      'password',
      'email',
      {required: false, param: 'wallet'},
      {required: false, param: 'p'},
      {required: false, param: 'pi'}
    ];

    requestHelpers.pickParams(requiredProperties, req, function (error, params) {

      if (error) {
        return res.badRequest('missing_parameter', error);
      }

      // Set object
      params.object = req.object;
      params.ip     = req.ip;

      sails.services.visitorservice.register(params, function (error, record) {
        if (error) {
          return res.badRequest(error);
        }

        return res.ok(record);
      });
    });
  }
   
};
