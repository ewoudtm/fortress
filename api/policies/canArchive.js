module.exports = function (req, res, next) {
  var archived = req.param('archived'),
      ownerSide = req.thread.to === req.session.user ? 'to' : 'from';

  if (!archived) {
    return next();
  }

  req.body[ownerSide + 'Archived'] = true;

  next();
};
