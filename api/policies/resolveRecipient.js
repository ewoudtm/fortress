module.exports = function(req, res, next) {

  var thread = req.body
    , messages = thread.messages
    , recipient;

  if (messages.length > 1) {
    return res.badRequest('invalid_parameter', 'messages');
  }

  if (!messages[0].to) {
    return res.badRequest('missing_parameter', 'message.to');
  }

  recipient = messages[0].to;

  sails.models.user.findOne().where({or: [{username: recipient}, {id: recipient}]}).exec(function(error, data) {
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
