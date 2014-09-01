var connections = {},
    userService;

userService = {

  /**
   * Update the ID of the socket connection for a user.
   *
   * @param {String} userId
   * @param {String} socketId
   */
  updateSocketId: function (userId, socketId) {
    sails.models.user.update(userId, {socketId: socketId}).exec(function (error) {
      if (error) {
        // @todo decide what to do with errors.
      }

      if (null === socketId) {
        delete connections[userId];
      } else {
        connections[userId] = socketId;
      }
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
    sails.models.user.find({username: username, object: object}, function (error, matches) {
      if (error) {
        return callback(error);
      }

      callback(null, matches.length === 0);
    });
  },

  wouldBeDuplicate: function (userCredentials, callback) {
    var duplicateCheckCriteria = {
      object: userCredentials.object
    };

    // Probably an import.
    if (!userCredentials.username) {
      duplicateCheckCriteria.email = userCredentials.email;
    } else {
      duplicateCheckCriteria.or = [
        {username: userCredentials.username},
        {email: userCredentials.email}
      ];
    }

    sails.models.user.find(duplicateCheckCriteria, function (error, results) {
      if (error) {
        return callback(error);
      }

      var isDuplicate = !!results.length;

      if (!isDuplicate) {
        return callback(null, false);
      }

      callback(null, results[0].email === userCredentials.email ? 'email' : 'username');
    });
  },

  register: function (req, res) {

    /**
     * - role
     * - username
     * - email
     * - password
     * -
     */
    // Check if username or email combo with object Id already exists (in policy)
    // Check if it's a wallet register, if so, send jsonp to wallet.
    // Attach object to user
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
   * Send an event to a specific user.
   *
   * @param {String} userId
   * @param {String} event
   * @param {*}      data
   */
  emitTo: function (userId, event, data) {

    function emit() {
      return sails.sockets.emit(connections[userId], event, data);
    }

    if (connections[userId]) {
      return emit();
    }

    // Performance is key. No need to look up the user if the application isn't scaled anyway.
    if (!sails.config.scaling.scaled) {
      return;
    }

    // Fetch the user and find the socket id.
    sails.models.user.findOne(userId).exec(function (error, data) {
      if (error) {
        // @todo decide what to do with errors
      }

      if (null === data.socketId) {
        return;
      }

      connections[userId] = data.socketId;

      emit();
    });
  }
};

module.exports = userService;
