module.exports = function (req, res, next) {
  if (
    !req.trackthis ||
    !req.trackthis.producer ||
    !req.trackthis.product ||
    !req.trackthis.consumer
  ) {
    return next();
  }

  // Request doesn't have to wait for us.
  sails.services.trackthisservice.track(req, function (error) {
    if (error) {
      return next(error);
    }

    next();
  });
};
