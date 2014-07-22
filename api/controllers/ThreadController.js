/**
 * ThreadController
 *
 * @description :: Server-side logic for managing threads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  // Here until I find a more viable method using blueprints.
  markRead: function (req, res) {

    if (!req.body.thread) {
      return res.badRequest('missing_parameter', 'thread');
    }

    sails.models['message'].update({to: req.session.user, thread: req.body.thread}, {read: true}).exec(function (error, updated) {
      if (error) {
        return res.serverError('database_error', error);
      }

      return res.ok();
    });
  }
};
