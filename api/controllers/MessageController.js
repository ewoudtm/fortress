module.exports = {
  inbox   : function (req, res) {
    var userId = req.session.user
      , threadCriteria = {
          where: {
            or: [
              {
                to: userId
              },
              {
                from: userId
              }
            ]
          },
          sort : 'updatedAt desc' // updatedAt gets upped on new reply.
        }
      , messageCriteria = {
          limit: 1,
          sort : 'createdAt desc'
        }
      , limit = req.param('limit')
      , skip = req.param('skip')
      , findQuery;

    // pagination
    if(skip && !isNaN(parseInt(skip, 10))) {
      threadCriteria.skip = skip;
    }

    if(limit && !isNaN(parseInt(limit, 10))) {
      threadCriteria.limit = limit;
    }

    findQuery = sails.models.thread.find(threadCriteria);

    findQuery.populate('from').populate('to').populate('messages', messageCriteria);

    findQuery.exec(function (error, results) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.json(sails.services.messageservice.flatten(userId, results));
    });
  },

  // Here until I find a more viable method using blueprints.
  markRead: function (req, res) {
    if (!req.body.id) {
      return res.badRequest('missing_parameter', 'id');
    }

    sails.models.message.update({to: req.session.user, id: req.body.id}, {read: true}).exec(function (error) {
      if (error) {
        return res.serverError('database_error', error);
      }

      return res.ok();
    });
  },

  /**
   * @todo solve this with the count blueprint and a policy to set the criteria
   * @param req
   * @param res
   */
  unread: function (req, res) {
    sails.models.message.count({read: false, to: req.session.user}, function (error, unreadCount) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok({count: unreadCount});
    });
  }
};
