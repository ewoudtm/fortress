var requestHelpers = require('request-helpers');

/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function (req, res, next) {

  var thread = {},
      recipient,
      userQuery;

  requestHelpers.pickParams(['to', 'subject', 'body'], req, function (error, params) {
    if (error) {
      return res.badRequest('missing_parameter', error);
    }

    recipient = params.to;
    userQuery = sails.models.user.findOne().where({
      //object: req.object.id, Disabled until we have default object and an "or"
      or    : [
        {username: recipient},
        {id: recipient}
      ]
    });

    userQuery.exec(function (error, data) {
      if (error) {
        return res.serverError('database_error', error);
      }

      if (!data) {
        return res.badRequest('Unknown recipient.');
      }

      if (!req.trackthis) {
        req.trackthis = {};
      }

      // We only need the producer if it's not a visitor.
      if (!data.visitor) {
        req.trackthis.producer = data;
        req.trackthis.extraUnique = 'new';
      }

      thread.to = data.id;
      thread.from = req.session.user;
      thread.subject = params.subject;
      thread.messages = [
        {
          from   : req.session.user,
          to     : data.id,
          initial: true,
          body   : params.body
        }
      ];

      req.body = thread;

      next();
    });
  });
};
