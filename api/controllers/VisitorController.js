/**
 * ThreadController
 *
 * @description :: Server-side logic for managing threads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  setUsername: function (req, res) {
    if (!req.body.username) {
      return res.badRequest('missing_parameter', 'username');
    }

    sails.services.userservice.usernameAvailable(req.body.username, function (error, available) {
      if (error) {
        return res.serverError('database_error', error);
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
  }
};
