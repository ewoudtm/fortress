/**
 * ThreadController
 *
 * @description :: Server-side logic for managing threads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  // Here until I find a more viable method using blueprints.
  markRead: function (req, res) {
    var searchCriteria;

    if (!req.body.thread) {
      return res.badRequest('missing_parameter', 'thread');
    }

    searchCriteria = {where: { to: req.session.user, thread: req.body.thread}};

    sails.models.message.update(searchCriteria, {read: true}).exec(function (error) {
      if (error) {
        return res.serverError('database_error', error);
      }

      return res.ok();
    });
  },

  getThreadCount: function (req, res) {
    var userId = req.session.user;

    async.parallel({
      to : function (callback) {
        sails.models.thread.count({to: userId}, callback);
      },
      from : function (callback) {
        sails.models.thread.count({from: userId}, callback);
      }
    }, function (error, results) {
      if (error) {
        return res.negotiate(error);
      }

      res.ok({count: results.to + results.from});
    });
  }
};
