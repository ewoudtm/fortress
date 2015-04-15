module.exports = function (req, res, next) {
  var mail     = req.param('mail'),
      siteUrl  = req.param('url');

  if (typeof mail === 'undefined') {
    return next();
  }

  if (typeof siteUrl === 'undefined') {
    return res.badRequest('missing_parameter', 'url');
  }

  sails.services.camspotterservice.resolve(req, res, function (error) {
    if (error) {
      return res.serverError('camspotter_error', error);
    }

    next();
  });
};
