module.exports = function (req, res, next) {
  var threadId = req.param('id'),
      findThread = sails.models.thread.findOne(threadId);

  findThread.exec(function (error, thread) {
    if (error) {
      return res.negotiate(error);
    }

    if (!thread) {
      return res.notFound();
    }

    if (thread.to !== req.session.user && thread.from !== req.session.user) {
      return res.forbidden();
    }

    req.thread = thread;

    next();
  });
};
