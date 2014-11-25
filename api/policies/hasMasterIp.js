module.exports = function(req, res, next) {
  console.log(req.ip);
  if (sails.config.system.masterIps.indexOf(req.ip) > -1) {
    return next();
  }

  return res.forbidden('You are not permitted to perform this action on ip ' + req.ip);
};
