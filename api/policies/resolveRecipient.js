/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  var thread = req.body
    , messages = thread.messages
    , recipient;

  if (messages.length > 1) {
    return res.badRequest("Too many messages.");
  }

  if (!messages[0].to) {
    return res.badRequest('User is mandatory.');
  }

  recipient = messages[0].to;

  sails.models['user'].findOne().where({or: [{username: recipient}, {id: recipient}]}).exec(function(error, data) {
    if (error) {
      return res.serverError(error);
    }

    if (!data) {
      return res.badRequest('Unknown recipient.');
    }

    messages[0].to   = data.id;
    messages[0].from = req.session.user;
    thread.to        = data.id;
    thread.from      = req.session.user;

    next();
  });
};
