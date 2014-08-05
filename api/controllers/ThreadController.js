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

    searchCriteria = {where: { or: [{to: req.session.user}, {from: req.session.user}], thread: req.body.thread}};

    sails.models['message'].update(searchCriteria, {read: true}).exec(function (error, updated) {
      if (error) {
        return res.serverError('database_error', error);
      }

      return res.ok();
    });
  },

  getThreadCount: function (req, res) {
    var userId = req.session.user
      , searchCriteria = {
          where: {
            or: [
              {
                to: userId
              },
              {
                from: userId
              }
            ]
          }
        };

    sails.models['thread'].count(searchCriteria, function (error, count) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok({count: count});
    });
  }
};
