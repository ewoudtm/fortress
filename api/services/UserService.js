var connections = {}
  , userService;

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
   * @param {Function} callback
   */
  usernameAvailable : function(username, callback) {
    sails.models.user.find({username: username}, function(error, matches) {
      if (error) {
        return callback(error);
      }

      callback(null, matches.length === 0);
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
