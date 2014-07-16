/**
 * ThreadController
 *
 * @description :: Server-side logic for managing threads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  setUsername : function(req, res) {
    if (!req.body.username) {
      return res.badRequest('missing_parameter', 'username');
    }

    sails.models['user'].update(req.session.user, {username: req.body.username}).exec(function(error) {
      if (error) {
        return res.badRequest('database_error');
      }

      sails.models['visitor'].update(req.session.userInfo.visitorId, {username: req.body.username}).exec(function(error) {
        if (error) {
          return res.badRequest('database_error');
        }

        req.session.userInfo.username = req.body.username;

        res.ok();
      });
    });
  }
};
