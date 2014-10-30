var md5         = require('MD5'),
    connections = {},
    userService;

userService = {

  /**
   * Update the ID of the socket connection for a user.
   *
   * @param {String} userId
   * @param {String} socketId
   * @param {Function} callback
   */
  updateSocketId: function (userId, socketId, callback) {
    callback = callback || function () { };

    sails.models.user.update(userId, {socketId: socketId}).exec(function (error) {
      if (error) {
        callback(error);
      }

      if (null === socketId) {
        delete connections[userId];
      } else {
        connections[userId] = socketId;
      }

      callback(null, socketId);
    });
  },

  /**
   * Check if a username is available.
   *
   * @param {string}   username
   * @param {string}   object
   * @param {Function} callback
   */
  usernameAvailable: function (username, object, callback) {
    object = (typeof object === 'object' ? object.id : object);

    sails.models.user.find({username: username, object: object}, function (error, matches) {
      if (error) {
        return callback(error);
      }

      callback(null, matches.length === 0);
    });
  },

  wouldBeDuplicate: function (userCredentials, done) {
    function doDuplicateCheck(field, value, callback) {
      var criteria = {
        object : (typeof userCredentials.object === 'object' ? userCredentials.object.id : userCredentials.object)
      };

      criteria[field] = value;

      sails.models.user.find(criteria, function (error, results) {
        if (error) {
          return callback(error);
        }

        return callback(null, !!results.length ? field : false);
      });
    }

    // If there's no username supplied, only check if email exists
    if (!userCredentials.username) {
      return doDuplicateCheck({email: userCredentials.email}, done);
    }

    // Check both username and email.
    async.parallel({
      user: function (callback) {
        doDuplicateCheck('username', userCredentials.username, callback);
      },
      email: function (callback) {
        doDuplicateCheck('email', userCredentials.email, callback);
      }
    }, function (error, result) {
      if (error) {
        return done(error);
      }

      if (result.user) {
        return done(null, result.user);
      }

      if (result.email) {
        return done(null, result.email);
      }

      done(error, false);
    });
  },

  /**
   * Connect a client and store his/her socket ID.
   *
   * @param {String} userId
   * @param {String} socket
   */
  connect: function (userId, socket) {
    var socketId = sails.sockets.id(socket);

    this.updateSocketId(userId, socketId);
  },

  /**
   * Disconnect a client and remove his/her socket ID.
   *
   * @param {String} userId
   */
  disconnect: function (userId) {
    this.updateSocketId(userId, null);
  },

  /**
   * Disconnect a client and remove his/her socket ID.
   *
   * @param {String} userId
   */
  disconnectBySocket: function (socket) {
    var socketId = sails.sockets.id(socket),
        self     = this;

    sails.models.user.findOne({socketId: socketId}, function (error, user) {
      if (error || !user) {
        return;
      }

      self.updateSocketId(user.id, null);
    });
  },

  /**
   * Convenience method. Verifies the given `user` is a user object.
   *
   * @param user
   * @param callback
   * @param populateAll
   * @returns {*}
   */
  getUser : function (user, callback, populateAll) {
    if (typeof user === 'object') {
      return callback(null, user);
    }

    var find = sails.models.user.findOne(user);

    if (populateAll) {
      find.populateAll();
    }

    find.exec(callback);
  },

  /**
   * Generate a hash for the user.
   *
   * @param {{}}      user
   * @param {String}  [type]
   *
   * @returns {String}
   */
  generateHash: function (user, type) {
    type = type || '';

    var magic = user.id.toString().replace(/[a-z]/gi, ''),
        veil = Math.abs(~~~(magic << Math.ceil(magic.split('').reverse().join('') / 5)) ^ magic);

    veil = veil.toString() + type;

    return md5([
      user.id,
      user.email,
      veil,
      typeof user.object === 'object' ? user.object.id : user.object
    ].join(''));
  },

  isConnected : function (userId, callback) {
    this.getSocketId(userId, function (error, socketId) {
      if (error) {
        return callback(error);
      }

      return callback(null, !!socketId);
    });
  },

  getSocketId : function (userId, callback) {
    if (connections[userId]) {
      return callback(null, connections[userId]);
    }

    // Performance is key. No need to look up the user if the application isn't scaled anyway.
    if (!sails.config.scaling.scaled) {
      return callback(null, null);
    }

    // Fetch the user and find the socket id.
    sails.models.user.findOne(userId).exec(function (error, data) {
      if (error) {
        return callback(error);
      }

      if (null === data.socketId) {
        return callback(null, null);
      }

      connections[userId] = data.socketId;

      return callback(null, connections[userId]);
    });
  },

  /**
   * Send an event to a specific user.
   *
   * @param {String}   userId
   * @param {String}   event
   * @param {*}        data
   * @param {Function} callback
   */
  emitTo: function (userId, event, data, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    function emit() {
      return sails.sockets.emit(connections[userId], event, data);
    }

    if (connections[userId]) {
      return callback(null, emit());
    }

    // Performance is key. No need to look up the user if the application isn't scaled anyway.
    if (!sails.config.scaling.scaled) {
      return callback();
    }

    // Fetch the user and find the socket id.
    sails.models.user.findOne(userId).exec(function (error, data) {
      if (error) {
        return callback(error);
      }

      if (null === data.socketId) {
        return callback();
      }

      connections[userId] = data.socketId;

      return callback(null, emit());
    });
  }
};

module.exports = userService;
