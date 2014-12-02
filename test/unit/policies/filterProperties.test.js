var assert      = require('chai').assert,
    sinon       = require('sinon'),
    filterProperties;

describe('filterProperties()', function () {
  before(function () {
    filterProperties = sails.hooks.policies.middleware.filterproperties;
  });

  context('no model set in req.options', function () {
    it('should call next', function () {
      var req = {
            options: {}
          },
          res = {},
          next = sinon.spy();

      filterProperties(req, res, next);

      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly());
      assert.isUndefined(req.options.values);
    });
  });

  context('model set in req.options', function () {
    it('should set blacklisted properties and call next', function () {
      var req = {
            options: {model: 'user'}
          },
          res = {},
          next = sinon.spy();

      filterProperties(req, res, next);

      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly());
      assert.sameMembers(req.options.values.blacklist, [
        'country',
        'createdAt',
        'emailVerified',
        'id',
        'notificationEmailVerified',
        'object',
        'partnerCode',
        'partnerInfo',
        'password',
        'performer',
        'roles',
        'socketId',
        'updatedAt',
        'username',
        'visitor'
      ]);
    });
  });
});
