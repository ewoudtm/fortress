/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var applicableRoutes = ['/visitor/identity', '/visitor/username'];

module.exports = function(req, res, next) {

  if (applicableRoutes.indexOf(req.route.path) === -1) {
    return next();
  }

  req.options.user = req.session.user;

  next();
};
