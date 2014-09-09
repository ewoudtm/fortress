module.exports = function (req, res, next) {
  if (!req.body.thread) {
    return res.badRequest('missing_parameter', 'thread');
  }

  if (!req.body.body) {
    return res.badRequest('missing_parameter', 'body');
  }

  sails.models['message'].findOne({thread: req.body.thread}).exec(function (error, data) {
    if (error) {
      return res.serverError(error);
    }

    if (!req.trackthis) {
      req.trackthis = {};
    }

    // Fetch TO. If to !== visitor, set producer.
    if (data.to !== req.session.user) {
      req.trackthis.producer = data;
    }

    req.body.to = data.to === req.session.user ? data.from : data.to;
    req.body.from = req.session.user;

    if ('visitor' !== req.session.userInfo.authenticatedRole) {
      return next();
    }

    sails.services.userservice.getUser(req.body.to, function (error, user) {
      if (error) {
        return next(error);
      }

      req.trackthis.producer = user;
      req.trackthis.extraUnique = 'reply';

      next();
    });
  });
};
