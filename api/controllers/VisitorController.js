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
  },

  delete: function (req, res) {
    if (!req.session.user) {
      return res.forbidden();
    }

    const currentUser = req.session.user;
    const currentVisitor = Visitor.findOne({user: currentUser.id})
      .catch((err) => { return res.badRequest('database_error', err) })

    if (currentVisitor === {} || currentVisitor === undefined || currentVisitor === null) { return res.notFound(); }

    // delete messages and threads from currentUser
    messageservice.deleteUserMessages(currentUser, ((err, res) => {
      if (err) { return res.badRequest('database_error', err) };
    }));

    // delete wallet of current user
    walletservice.delete(currentVisitor.id, ((err, res) => {
      if (err) { return res.badRequest('database_error', err) };
    }));

    // delete visitor record of current user
    visitorservice.delete(currentVisitor.id, ((err, res) => {
      if (err) { return res.badRequest('database_error', err) };
    }));

    // delete user record of current user
    userservice.delete(currentUser.id, ((err, res) => {
      if (err) { return res.badRequest('database_error', err) };
    }));

    res.ok();
  }
   
};
