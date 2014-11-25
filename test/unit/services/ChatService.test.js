var assert  = require('chai').assert,
    io = require('socket.io-client');

describe('ChatService', function () {
  describe('.initialize()', function () {
    it('Should call back after initialization.', function (done) {
      var chatservice = sails.services.chatservice;
      chatservice.initialize(done);
    });
  });
  describe('.getSocket()', function () {
    it('Should return the socket.', function (done) {
      var chatservice = sails.services.chatservice;
      chatservice.initialize(function() {
        assert.instanceOf(chatservice.getSocket().socket, io.Socket);
        done();
      });
    });
  });
});
