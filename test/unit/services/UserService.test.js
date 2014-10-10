var assert = require('chai').assert;

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
});
