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
  }
};
