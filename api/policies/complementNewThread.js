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

  var params = req.body
    , thread = {}
    , recipient
    , userQuery;

  if (!params.to) {
    return res.badRequest('missing_parameter', 'to');
  }

  if (!params.subject) {
    return res.badRequest('missing_parameter', 'subject');
  }

  if (!params.body) {
    return res.badRequest('missing_parameter', 'body');
  }

  recipient = params.to;
  userQuery = sails.models['user'].findOne().where({or: [
    {username: recipient},
    {id: recipient}
  ]});

  userQuery.exec(function (error, data) {
    if (error) {
      return res.serverError('database_error', error);
    }

    if (!data) {
      return res.badRequest('Unknown recipient.');
    }

    thread.to       = data.id;
    thread.from     = req.session.user;
    thread.subject  = params.subject;
    thread.messages = [
      {
        from: req.session.user,
        to  : data.id,
        body: params.body
      }
    ];

    req.body = thread;

    next();
  });
};
