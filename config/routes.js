/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://links.sailsjs.org/docs/config/routes
 */

module.exports.routes = {
  // MessageController
  'post /message'                : 'MessageController.create',
  'get /message/inbox'           : 'MessageController.inbox',
  'put /message/mark-read'       : 'MessageController.markRead',
  'get /message/unread'          : 'MessageController.unread',

  // ThreadController
  'get /thread'                  : 'ThreadController.find',
  'put /thread/mark-read'        : 'ThreadController.markRead',
  'get /thread/thread-count'     : 'ThreadController.getThreadCount',
  'get /thread/:id'              : 'ThreadController.findonesimple',

  // UserController
  'put /user/password'           : 'UserController.updatePassword',
  'put /user/:id'                : 'UserController.update',
  'get /user/:id/unsubscribe'    : 'UserController.unsubscribe',
  'get /user/:id/verify/:type'   : 'UserController.verify', // /user/123/verify/notification-email?hash=
  'get /user/logout'             : 'UserController.logout',
  'post /user/login'             : 'UserController.login',
  'post /user/login-by-hash'     : 'UserController.loginByHash',
  'get  /user/login-by-hash'     : 'UserController.loginByHash',
  'get /user/username/:id'       : 'UserController.getUsername',
  'post /user/username-available': 'UserController.usernameAvailable',
  'get /user/identity/:role?'    : 'UserController.getIdentity',

  // VisitorController
  'get  /visitor/register'       : 'VisitorController.register',
  'post /visitor/register'       : 'VisitorController.register',
  'put /visitor/username'        : 'VisitorController.setUsername', // @see policies/resolveVisitorIdentity
  'put /visitor/:id?'            : 'VisitorController.update',
  'get /visitor/identity'        : 'VisitorController.find',        // @see policies/resolveVisitorIdentity

  // PerformerController
  'get /performer/count'         : 'PerformerController.count',
  'get /performer/:username'     : 'PerformerController.findonesimple',

  // ObjectController
  'get /object/:id?'             : 'ObjectController.find',
  'post /object'                 : 'ObjectController.create',
  'put /object/:id'              : 'ObjectController.update',
  'delete /object/:id'           : 'ObjectController.destroy',

  // FollowController
  'get /follow/:username?'       : 'FollowController.find',
  'post /follow'                 : 'FollowController.create',
  'put /follow/:id'              : 'FollowController.update',
  'delete /follow/:username'     : 'FollowController.destroy',

  // Misc
  'get /connect/getcookie'       : 'ConnectController.getCookie',
  'get /connect/safari-getcookie': 'ConnectController.safariGetCookie',

  // System
  'get /system/total-connections': 'SystemController.totalConnections',
  'get /system/verify/:type'     : 'SystemController.verify',
  'get /system/debug/:toggle'    : 'SystemController.debug'
};
