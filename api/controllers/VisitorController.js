/**
 * ThreadController
 *
 * @description :: Server-side logic for managing threads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  setUsername : function(req, res) {
    if (!req.body.username) {
      return res.badRequest('missing_parameter', 'Username was not supplied');
    }

    sails.models['user'].update(req.session.user, {username: req.body.username});
  }
};
