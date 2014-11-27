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

  describe('.update()', function () {
    context('password supplied', function () {
      it('Should hash the password', function (done) {
        sails.models.user.findOne(999, function (error, user) {
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
