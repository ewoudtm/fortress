var assert = require('chai').assert,
    bcrypt = require('bcrypt');

describe('UserModel', function () {
  describe('.getValidRoles()', function () {
    it('should return the valid roles.', function (done) {
      var validRoles = ['visitor', 'performer'];

      assert.deepEqual(sails.models.user.getValidRoles(), validRoles);

      done();
    });
  });

  describe('.toJSON()', function () {
    it('Should not return email or password', function (done) {
      sails.models.user.findOne(990, function (error, user) {
        var jsonified = JSON.parse(JSON.stringify(user)); // Test toJSON and also indirectly if toJSON is called.

        assert.isUndefined(jsonified.password, 'Password was not deleted!');
        assert.isUndefined(jsonified.email, 'Email was not deleted!');
        assert.isUndefined(jsonified.notificationEmail, 'NotificationEmail was not deleted!');
        assert.strictEqual(jsonified.username, 'changepassword', 'Username was different!');

        done();
      });
    });
  });

  describe('.update()', function () {
    context('password supplied', function () {
      it('Should hash the password', function (done) {
        sails.models.user.findOne(990, function (error, user) {
          assert.isNull(error);
          bcrypt.compare('keeshond', user.password, function (error, passwordIsValid) {
            assert.isUndefined(error);
            assert.isTrue(passwordIsValid);
            user.password = 'something else';
            user.save(function (error, user) {
              assert.isNull(error);
              bcrypt.compare('something else', user.password, function (error, passwordIsValid) {
                assert.isUndefined(error);
                assert.isTrue(passwordIsValid);
                done();
              });
            });
          });
        });
      });
    });
  });
});
