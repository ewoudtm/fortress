/**
 * Message.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    thread: {
      model: 'thread'
    },
    body  : 'text',
    read  : {
      type      : 'boolean',
      defaultsTo: false
    },
    from  : {
      model: 'user'
    },
    to    : {
      model: 'user'
    },
    toJSON: function () {
      var modelInstance = this.toObject();

      modelInstance._modelName = 'message';

      return modelInstance;
    }
  },

  afterCreate: function (newMessage, next) {
    var threadId = newMessage.thread;

    if (typeof newMessage.thread === 'object') {
      threadId = newMessage.thread.id;
    }

    // Update the updatedAt date for inbox sorting.
    sails.models.thread.update(threadId, {}).exec(function (error, thread) {
      next();

      if (error) {
        return sails.log.error(error);
      }

      var messageService = sails.services.messageservice,
          userService = sails.services.userservice;

      // Fetch populated users first. Otherwise every service does it (performance).
      async.parallel({
        from: function (callback) {
          userService.getUser(newMessage.from, callback, true);
        },
        to  : function (callback) {
          userService.getUser(newMessage.to, callback, true);
        }
      }, function (error, results) {
        if (error) {
          return sails.log.error('afterCreate in Message model failed on fetching `from` and `to`');
        }

        newMessage.from = results.from;
        newMessage.to = results.to;
        newMessage.thread = thread[0];

        // Yes, this can be run after calling next() because the email isn't that important.
        messageService.sendNotification(newMessage);
        messageService.abuseCheck(newMessage);
        messageService.publishReply(newMessage);
      });
    });
  }
};
