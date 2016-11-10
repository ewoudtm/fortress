module.exports = function(req, res, next) {
  var host        = req.host,
      xObjectHost = req.param('X-Object-Host') || (req.get ? req.get('X-Object-Host') : null);

  if (req.isSocket) {
    host = req.socket.host;
  }

  if (xObjectHost) {
    host = xObjectHost;
  }

  if ('127.0.0.1' === host) {
    host = sails.config.system.defaultObject.host;
  }

  sails.services.objectservice.resolve(host, function(error, object) {
    if (error) {
      return res.badRequest('Unknown object.');
    }

    req.object = object;

    next();
  });
};
