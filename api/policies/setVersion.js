module.exports = function (req, res, next) {
  if (req.isSocket) {
    req.apiVersion = req.socket.__api_version || null;
  } else if (req.param('__api_version')) {
    req.apiVersion = req.param('__api_version');

    delete req.body.__api_version;
    delete req.query.__api_version;
  }

  next();
};
