var io = require('socket.io-client')
  , socket = null;

module.exports = {
  getSocket: function () {
    return socket;
  },

  initialize: function (callback) {
    var config = sails.config.chat;

    if (socket) {
      return callback();
    }

    socket = io.connect(config.server, config.socket);

    socket.emit('hello', { type: 'admin' }, function (data) {
      callback(null, socket);
    });
  }
};
