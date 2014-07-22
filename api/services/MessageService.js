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

    /**
     * +===========================================================================+
     * |                                                                           |
     * |                              [TEMPORARY FIX]                              |
     * |                                                                           |
     * | This logic is here until the criteria bug with populate has been solved.  |
     * |                                                                           |
     * | @see https://github.com/balderdashy/waterline/issues/247                  |
     * | @see https://github.com/balderdashy/waterline/issues/334                  |
     * | @todo Fix issue and remove TMP fix                                        |
     * |                                                                           |
     * +---------------------------------------------------------------------------+
     * |                                                                           |
     /* |*/  var newest = {createdAt: 0}, tmp, date;
    /* |*/
    /* |*/
    /* |*/
    /* |*/
    for (tmp = 0; tmp < thread.messages.length; tmp++) {                /* |*/
      /* |*/
      date = new Date(thread.messages[tmp].createdAt);
      /* |*/
      /* |*/
      newest = date > newest.createdAt ? thread.messages[tmp] : newest;
      /* |*/
      /* |*/
    }
    /* |*/
    /* |*/
    /* |*/
    /* |*/
    message = newest;
    /* |
     * |                                                                           |
     * +---------------------------------------------------------------------------+
     * |                                                                           |
     * |                            [END TEMPORARY FIX]                            |
     * |                                                                           |
     * +===========================================================================+
     */

    if (message.from === thread.from.id) {
      from = thread.from.username;
      to = thread.to.username;
    } else {
      from = thread.to.username;
      to = thread.from.username;
    }

    return {
      id         : message.id,
      created    : message.createdAt,
      updated    : message.updatedAt,
      from       : from,
      to         : to,
      subject    : thread.subject,
      thread     : thread.id,
      body       : message.body,
      read       : message.read,
      direction  : message.from === userId ? 'out' : 'in',
      participant: message.from === userId ? message.to : message.from
    };
  }
};
