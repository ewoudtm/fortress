var assert = require('chai').assert,
    sinon  = require('sinon'),
    isAuthenticated;

describe('isAuthenticated()', function () {
  before(function () {
    isAuthenticated = sails.hooks.policies.middleware.isauthenticated;
  });

  context('no logged in user', function () {
    it('should send a bad request response', function () {
      var req = {
            session: {}
          },
          res = {
            forbidden: sinon.spy()
          },
          next = sinon.spy();

      isAuthenticated(req, res, next);

      assert.isTrue(res.forbidden.calledOnce);
      assert.isTrue(res.forbidden.calledWithExactly('no_identity', 'You are not permitted to perform this action.'));
      assert.isFalse(next.called)
    });
  });

  context('user logged in', function () {
    it('should call next', function () {
      var req = {
            session: {
              user: 999
            }
          },
          res = {
            forbidden: sinon.spy()
          },
          next = sinon.spy();

      isAuthenticated(req, res, next);

      assert.isFalse(res.forbidden.called);
      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly())
    });
  });
});
