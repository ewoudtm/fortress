module.exports = {
  inbox : function (req, res) {
    var user           = req.param('user'),
        threadCriteria = {
          sort : 'updatedAt desc', // updatedAt gets upped on new reply
          where: {
            or: [
              { to  : user },
              { from: user }
            ]
          }
        },
        limit = req.param('limit'),
        skip  = req.param('skip'),
        messageCriteria = {
          limit: 1,
          sort : 'createdAt desc'
        },
        findQuery;

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

      res.json(sails.services.messageservice.flatten(user, results));
    });
  },

  markMsgRead: function (req, res) {
    var user    = req.param('user'),
        message = req.param('message');

    if (!message) {
      return res.badRequest('missing_parameter', 'message');
    }

    sails.models.message.update({to: user, id: message}, {read: true}).exec(function (error) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok();
    });
  },

  unreadMessages: function (req, res) {
    var user = req.param('user');

    sails.models.message.count({read: false, to: user}, function (error, unreadCount) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok({count: unreadCount});
    });
  },

  findThread : function (req, res) {
    var user  = req.param('user'),
        where = {
          or: [
            {to  : user},
            {from: user}
          ]
        };

    sails.models.thread.find(where).exec(function (error, result) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok(result);
    });
  },

  markThreadRead: function (req, res) {
    var user   = req.param('user'),
        thread = req.param('thread'),
        searchCriteria;

    if (!thread) {
      return res.badRequest('missing_parameter', 'thread');
    }

    searchCriteria = {
      where: {
        to    : user,
        thread: thread
      }
    };

    sails.models.message.update(searchCriteria, {read: true}).exec(function (error) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok();
    });
  },

  getThreadCount: function (req, res) {
    var user = req.param('user');

    async.parallel({
      to : function (callback) {
        sails.models.thread.count({to: user}, callback);
      },
      from : function (callback) {
        sails.models.thread.count({from: user}, callback);
      }
    }, function (error, results) {
      if (error) {
        return res.negotiate(error);
      }

      res.ok({count: results.to + results.from});
    });
  },

  loadMessages : function (req, res) {
    var thread  = req.param('thread'),
        user    = req.param('user'),
        query   = {
          where: {
            or: [
              { from: user },
              { to  : user }
            ],
            thread: thread
          },
          sort: 'createdAt DESC'
        };

    sails.models.message.find(query).exec(function (error, result) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok(result);
    });
  },

  reply : function (req, res) {
    var user     = req.param('user'),
        thread   = req.param('thread'),
        content  = req.param('content'),
        receiver = req.param('receiver'),
        query;

    if (!thread) {
      return res.badRequest('missing_parameter', 'thread');
    }

    if (!content) {
      return res.badRequest('missing_parameter', 'content');
    }

    if (!receiver) {
      return res.badRequest('missing_parameter', 'receiver');
    }

    query = {
      thread : thread,
      body   : content,
      read   : 0,
      from   : user,
      to     : receiver,
      initial: 0
    };

    // check if receiver exists
    sails.models.user.findOne(receiver).exec(function (error, userResult) {
      if (error) {
        return res.serverError('database_error', error);
      }

      if (!userResult) {
        return res.badRequest('invalid_receiver');
      }

      // check if thread exists
      sails.models.thread.findOne(thread).exec(function (error, threadResult) {
        if (error) {
          return res.serverError('database_error', error);
        }

        if (!threadResult) {
          return res.badRequest('invalid_thread');
        }

        sails.models.message.create(query).exec(function (error) {
          if (error) {
            return res.serverError('database_error', error);
          }

          res.ok();
        });
      });
    });
  }
};
