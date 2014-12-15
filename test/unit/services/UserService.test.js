var assert = require('chai').assert,
    io     = require('socket.io-client');

describe('UserService', function () {

  /**
   * Updating socketId cases
   */
  describe('.updateSocketId()', function () {
    it('Should update the socketId to a made-up value and return said value.', function (done) {
      var socketId = 'GiveMeMyBacon',
          userService = sails.services.userservice;

      userService.updateSocketId(999, socketId, function (error, newSocketId) {
        assert.isNull(error, 'Update returned error.');
        assert.equal(newSocketId, socketId, 'Returned socketId doesn\'t match supplied one.');

        userService.getUser(999, function (error, user) {
          assert.isNull(error, 'getUser returned error.');

          assert.equal(user.socketId, socketId, 'SocketId was not persisted.');

          done();
        });
      });
    });
  });

  describe('.wouldBeDuplicate()', function () {
    it ('Should verify this will not be a duplicate on email address.', function (done) {
      var userService = sails.services.userservice;
      userService.wouldBeDuplicate ({email : 'doesnotexist@islive.io', object: 1}, function (error, isDuplicate) {
        assert.notOk(error, 'There was an error');
        assert.notOk(isDuplicate, 'This is a duplicate');

        done();
      });
    });

    it ('Should verify this will be a duplicate on email address.', function (done) {
      var userService = sails.services.userservice;
      userService.wouldBeDuplicate ({email : 'fixture-test@islive.io', object: 1}, function (error, isDuplicate) {
        assert.notOk(error, 'There was an error');
        assert.isString(isDuplicate, 'User is not a duplicate');
        assert.equal(isDuplicate, 'email', 'Other unexpected field given.');

        done();
      });
    });

    it ('Should verify this will not be a duplicate on same email address but different object.', function (done) {
      var userService = sails.services.userservice;
      userService.wouldBeDuplicate ({email : 'fixture-test@islive.io', object: 2}, function (error, isDuplicate) {
        assert.notOk(error, 'There was an error');
        assert.notOk(isDuplicate, 'This is a duplicate');

        done();
      });
    });

    it ('Should verify this will not be a duplicate on username.', function (done) {
      var userService = sails.services.userservice;
      userService.wouldBeDuplicate ({email : 'doesnotexist@islive.io', username: 'doesntexist', object: 1}, function (error, isDuplicate) {
        assert.notOk(error, 'There was an error');
        assert.notOk(isDuplicate, 'This is a duplicate');

        done();
      });
    });

    it ('Should verify this will be a duplicate on username.', function (done) {
      var userService = sails.services.userservice;
      userService.wouldBeDuplicate ({email : 'doesnotexist@islive.io', username: 'fixturetest', object: 1}, function (error, isDuplicate) {
        assert.notOk(error, 'There was an error');
        assert.isString(isDuplicate, 'User is not a duplicate');
        assert.equal(isDuplicate, 'username', 'Other unexpected field given.');

        done();
      });
    });

    it ('Should verify this will not be a duplicate on same username but different object.', function (done) {
      var userService = sails.services.userservice;
      userService.wouldBeDuplicate ({email : 'fixture-test@islive.io', username: 'fixturetest', object: 2}, function (error, isDuplicate) {
        assert.notOk(error, 'There was an error');
        assert.notOk(isDuplicate, 'This is a duplicate');

        done();
      });
    });

    it('Should gracefully handle missing parameters.', function (done) {
      var userService = sails.services.userservice;
      userService.wouldBeDuplicate ({unknownproperty : 'unknownvalue', object: 2}, function (error, isDuplicate) {
        assert.notOk(error, 'There was an error');
        assert.notOk(isDuplicate, 'This is a duplicate');

        done();
      });
    });
  });

  /**
   * Generate hash cases
   */
  describe('.generateHash()', function () {
    var userInstance = {
      id    : 999,
      object: 1,
      email : 'fixture-test@islive.io'
    };

    it('Should create a hash based on the user object', function (done) {

      var userService = sails.services.userservice,
          hash = userService.generateHash(userInstance);

      assert.isString(hash, 'Returned hash is not a string.');
      assert.equal(
        hash,
        '95bca3166cba37310a5df39cdc022750',
        'The generated hash is different. Verifying hashes will fail!'
      );

      done();
    });

    it('Should generate a different hash when a type was supplied', function (done) {
      var userService = sails.services.userservice,
          hash = userService.generateHash(userInstance, 'verify');

      assert.isString(hash, 'Returned hash is not a string.');
      assert.notEqual(
        hash,
        '95bca3166cba37310a5df39cdc022750',
        'The generated hash is not different!'
      );
      assert.equal(
        hash,
        'c3c51549659232139eee95d2409fbfb9',
        'The generated hash is different. Verifying hashes will fail!'
      );

      done();
    });
  });

  describe('.emitTo()', function () {
    var socket,
        credentials = {
          role    : 'visitor',
          username: 'fixture-test@islive.io',
          password: 'keeshond'
        };

    before(function (done) {
      socket = io.connect('http://127.0.0.1:' + sails.config.port + '/', {'force new connection': true });
      socket.once('connect', done);
    });

    after(function () {
      socket.disconnect();
    });

    it('should emit to the user', function (done) {
      socket.emit('post', JSON.stringify({url: '/user/login', data: credentials}), function () {
        socket.on('something', function (data) {
          assert.deepEqual(data, {
            some: 'data'
          });
          done();
        });

        sails.services.userservice.emitTo(999, 'something', {some: 'data'});
      });
    });
  });
});
