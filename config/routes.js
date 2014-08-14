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
  'post /message'            : 'MessageController.create',
  'get /message/inbox'       : 'MessageController.inbox',
  'put /message/mark-read'   : 'MessageController.markRead',
  'get /message/unread'      : 'MessageController.unread',

  // ThreadController
  'put /thread/mark-read'    : 'ThreadController.markRead',
  'get /thread/thread-count' : 'ThreadController.getThreadCount',

  // UserController
<<<<<<< HEAD
  'post /user/login'          : 'UserController.login',
  'post /user/login-by-hash'  : 'UserController.loginByHash',
  'get /user/username/:id'    : 'UserController.getUsername',
  'get /user/identity/:role?' : 'UserController.getIdentity',

   // VisitorController
  'put /visitor/:id?'         : 'VisitorController.update',
  'get /visitor/identity'     : 'VisitorController.find',        // @see policies/resolveVisitorIdentity
  'put /visitor/username'     : 'VisitorController.setUsername', // @see policies/resolveVisitorIdentity

  'get /connect/getcookie'    : 'ConnectController.getcookie',
  'get /performer/:id'        : 'PerformerController.find',

  // If a request to a URL doesn't match any of the custom routes above,
  // it is matched against Sails route blueprints.  See `config/blueprints.js`
  // for configuration options and examples.

=======
  'post /user/login'         : 'UserController.login',
  'get /user/username/:id'   : 'UserController.getUsername',
  'get /user/identity/:role?': 'UserController.getIdentity',

  // VisitorController
  'put /visitor/username'    : 'VisitorController.setUsername', // @see policies/resolveVisitorIdentity
  'put /visitor/:id?'        : 'VisitorController.update',
  'get /visitor/identity'    : 'VisitorController.find',        // @see policies/resolveVisitorIdentity

  'get /connect/getcookie'  : 'ConnectController.getcookie',
  'get /performer/count'    : 'PerformerController.count',
  'get /performer/:username': 'PerformerController.findonesimple'
>>>>>>> 53c008299cc0c5697fc6d3d0461a737320c8ff7d
};
