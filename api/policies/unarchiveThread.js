module.exports = function (req, res, next) {
  var Thread = sails.models.thread,
      threadId = req.param('thread');

  Thread.update({id: threadId}, {
    fromArchived: false,
    toArchived: false
  }, function (error) {
    if (error) {
      return res.serverError(error);
    }

    next();
  });
};
