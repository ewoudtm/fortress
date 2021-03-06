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
      where,
      recipient,
      userQuery;

  requestHelpers.pickParams(['to', 'subject', 'body'], req, function (error, params) {
    if (error) {
      return res.badRequest('missing_parameter', error);
    }

    recipient = params.to;

    // @todo add object check when objects are allowed to have their own performers.
    if (recipient.toString().match(/^\d+$/)) {
      // Only look based on id
      where = {id: recipient};
    } else {
      // Only look based on username.
      where = {username: recipient};
    }

    userQuery = sails.models.user.findOne().where(where);

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
