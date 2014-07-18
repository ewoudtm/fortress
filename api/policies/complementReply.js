module.exports = function(req, res, next) {
  if (!req.body.thread) {
    return res.badRequest('missing_parameter', 'thread');
  }

  if (!req.body.body) {
    return res.badRequest('missing_parameter', 'body');
  }

  sails.models['message'].findOne({thread: req.body.thread}).exec(function(error, data) {
    if (error) {
      return res.serverError(error);
    }

    req.body.to = data.to === req.session.user ? data.from : data.to;
    req.body.from = req.session.user;

    next();
  });
};
