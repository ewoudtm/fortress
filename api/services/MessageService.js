var Censoring         = require('censoring'),
    nodemailer        = require('nodemailer'),
    sendmailTransport = require('nodemailer-sendmail-transport'),
    smtpClient        = nodemailer.createTransport(sendmailTransport()),
    scan;

module.exports = {
  getScanner  : function () {
    if (scan) {
      return scan;
    }

    scan = new Censoring();

    scan.enableFilters(sails.config.abuse.enabledFilters);
    scan.addFilterWords(sails.config.abuse.forbiddenWords);

    return scan;
  },
  publishInbox: function (thread, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    var self = this,
        userService = sails.services.userservice,
        target = typeof thread.to === 'object' ? thread.to.id : thread.to;

    userService.isConnected(target, function (error, isConnected) {
      if (error) {
        return callback(error);
      }

      if (!isConnected) {
        return callback();
      }

      sails.models.thread.findOne(thread.id).populateAll().exec(function (error, result) {
        if (error) {
          return callback(error);
        }

        userService.emitTo(target, 'inbox', {
          id  : result.id,
          verb: 'created',
          data: self.flatten(target, result)
        }, callback);
      });
    });
  },
  publishReply: function (message, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    var target = typeof message.to === 'object' ? message.to.id : message.to,
        userService = sails.services.userservice;

    userService.isConnected(target, function (error, isConnected) {
      if (error) {
        return callback(error);
      }

      if (!isConnected) {
        return callback();
      }

      var eventData = {
        id  : message.id,
        verb: 'created',
        data: message
      };

      userService.emitTo(target, message._modelName, eventData, callback);
    });
  },

  flatten: function (userId, thread) {
    var flattened, message, from, to, flatten;

    // If an array was supplied, call self over every entry.
    if (Array.isArray(thread)) {
      flattened = [];

      thread.forEach(function (entry) {
        flatten = this.flatten(userId, entry);

        if (flatten.to) {
          flattened.push(flatten);
        }
      }, this);

      return flattened;
    }

    if (thread.messages.length < 1) {
      return [];
    }

    message = thread.messages[0];

    if (thread.messages.length > 1) {
      sails.log.error('More than 1 message found... Weird?');
      sails.log.error(thread);
    }

    if (!thread.from || !thread.from.id) {
      return [];
    }

    if (message.from === thread.from.id) {
      from = thread.from.username;
      to = thread.to.username;
    } else {
      from = thread.to.username;
      to = thread.from.username;
    }

    return {
      _modelName : 'inbox',
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
  },

  /**
   * Check for abuse in a message.
   * NOTE: Method requires fully populated from, and to.
   * @todo this entire method ew ew ew ew ew. I'm so, so sorry for writing this. Don't hate me.
   *
   * @param message
   * @param callback
   */
  abuseCheck: function (message, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    var from = message.from,
        to = message.to,
        scanner;

    if (!to.visitor) {
      return callback(null, false); // Not monitoring visitors.
    }

    scanner = this.getScanner();

    scanner.prepare(message.body, true);

    if (!scanner.test()) {
      return callback(null, false);
    }

    var template = '\
          <table border="1" cellpadding="5">\
              <tr>\
                  <th align="left">From</th>\
                  <th align="left">To</th>\
                  <th align="left">Message</th>\
              </tr>\
              <tr>\
                  <td><i>' + from.username + '</i></td>\
                  <td><i>' + to.username + '</i></td>\
                  <td>' + scan.replace() + '</td>\
              </tr>\
          </table>',
        date = new Date(),
        dateString = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.toLocaleTimeString(),
        mailConfig;

    mailConfig = {
      from   : 'notifications@islive.io',
      to     : from.object.email,
      subject: 'Messaging, ' + from.username + ' on ' + dateString,
      html   : template
    };

    if(process.env.NODE_ENV === 'test') {
      return callback(null, true);
    }

    smtpClient.sendMail(mailConfig, function (error) {
      if (error) {
        sails.log.error('Failed to sent e-mail', error);

        return callback(error);
      }

      callback(null, true);
    });
  },

  /**
   * Send an email notification to the user
   * NOTE: Method requires fully populated from, and to.
   *
   * @param {{}} message
   * @param {Function} [callback]
   */
  sendNotification: function (message, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    var notificationService = sails.services.notificationservice;

    notificationService.send('new_message', message.to, {
      from     : notificationService.composeUserObject(message.from),
      initial  : message.initial,
      subject  : message.thread.subject
    }, callback);
  },

  /**
   * send an predefined message to a user
   *
   * @param  {integer}    receiver  The userid from the receiver
   * @param  {[Function]} callback  Optional callback
   * @return {bool}
   */
  sendWelcomeMessage: function (receiver, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    if (typeof receiver === 'object') {
      receiver = receiver.id;
    }

    var config   = sails.config.welcomeMsg,
        theadObj = {
          from     : config.performerId,
          to       : receiver,
          subject  : config.subject,
          messages : {
            body : config.message,
            from : config.performerId,
            to   : receiver
          }
        };

    if (!config.enabled) {
      return callback(null, false);
    }

    sails.models.thread.create(theadObj, function (error) {
      return callback(error, true);
    });
  },

  /**
   * Delete all messages of user
   * NOTE: Method requires fully populated from, and to.
   *
   * @param {{}} user
   * @param {Function} [callback]
   */
  deleteUserMessages: function (user, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };
    const userMessages = Message.find({ or: [{from: user.id}, {to: user.id}]})
    .then((userMessages) => { 
      if (userMessages === {} || userMessages === undefined || userMessages === null) { return callback(null, false) };
      Messages.destroy(userMessages)
        .catch((err) => { return callback(err, false) });
      
      const userThreads = Thread.find({ or: [{from: currentUser.id}, {to: currentUser.id}]})
      .then((userThreads) => { 
        if (userThreads !== {} || userThreads !== undefined || userThreads !== null) {
          Threads.destroy(userThreads)
          .catch((err) => { return callback(err, false) });
        }
      })
      .catch((err) => { return callback(err, false) });

    })
    .catch((err) => { return callback(err, false) })
  }
};
