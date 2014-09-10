var assert = require('chai').assert;

describe('UserModel', function () {
  describe('.getValidRoles()', function () {
    it('should return the valid roles.', function (done) {
      var validRoles = ['visitor', 'performer'];

      assert.deepEqual(sails.models.user.getValidRoles(), validRoles);

      done();
    });
  });
});
