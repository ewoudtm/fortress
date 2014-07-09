/**
 * Set to find where to = authenticated user's id, or from = authenticated user's id.
 */
module.exports = function(req, res, next) {
  if (!req.body.thread) {
    return res.badRequest('Required thread not supplied.');
  }

  if (!req.body.body) {
    return res.badRequest('Required body not supplied.');
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
