module.exports = {
  flatten: function (userId, thread) {
    var flattened, message, from, to;

    // If an array was supplied, call self over every entry.
    if (Array.isArray(thread)) {
      flattened = [];

      thread.forEach(function (entry) {
        flattened.push(this.flatten(userId, entry));
      }, this);

      return flattened;
    }

    message = thread.messages[0];

    if (thread.messages.length > 1) {
      sails.log.error('More than 1 message found... Weird?');
      sails.log.error(thread);
    }

    if (message.from === thread.from.id) {
      from = thread.from.username;
      to = thread.to.username;
    } else {
      from = thread.to.username;
      to = thread.from.username;
    }

    return {
      id          : message.id,
      created     : message.createdAt,
      updated     : message.updatedAt,
      from        : from,
      to          : to,
      subject     : thread.subject,
      thread      : thread.id,
      body        : message.body,
      read        : message.read,
      direction   : message.from === userId ? 'out' : 'in',
      participant : message.from === userId ? message.to : message.from
    };
  },

  /**
   * Send an email notification to the user
   *
   * @todo move this logic elsewhere. It's too message-notification specific.
   *
   * @param message
   * @param callback
   */
  sendNotification : function (message, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    var userService = sails.services.userservice;

    userService.getUser(message.to, function (error, to) {
      if (error) {
        return callback(error);
      }

      if (!to.visitor) {
        return callback({
          error      : 'not_implemented',
          description: "This feature hasn't been implemented yet."
        });
      }

      if (!to.mailable) {
        return callback({
          error      : 'not_mailable',
          description: "User indicated not to want to receive anymore mail from us."
        });
      }

      userService.getUser(message.from, function (error, from) {
        if (error) {
          return callback(error);
        }

        sails.services.walletservice.sendNotification(from, to, callback);
      }, true); // true = populateAll
    }, true); // true = populateAll
  }
};
