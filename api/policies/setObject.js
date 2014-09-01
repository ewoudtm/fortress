module.exports = function(req, res, next) {

  var host = req.host;

  if (req.isSocket) {
    host = req.socket.host;
  }

  sails.services.objectservice.resolve(host, function(error, object) {
    if (error) {
      return res.badRequest('Unknown object.');
    }

    req.object = object;

    next();
  });
};
