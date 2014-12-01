var assert      = require('chai').assert,
    sinon       = require('sinon'),
    isPerformer;

describe('isPerformer()', function () {
  before(function () {
    isPerformer = sails.hooks.policies.middleware.isperformer;
  });

  context('no performer role', function () {
    it('should send a forbidden response', function () {
      var req = {
            session: {
              userInfo: {
                roles: ['visitor']
              }
            }
          },
          res = {
            forbidden: sinon.spy()
          },
          next = sinon.spy();

      isPerformer(req, res, next);

      assert.isTrue(res.forbidden.calledOnce);
      assert.isTrue(res.forbidden.calledWithExactly('You are not permitted to perform this action.'));
      assert.isFalse(next.called)
    });
  });

  context('username exists', function () {
    it('should call next', function () {
      var req = {
            session: {
              userInfo: {
                roles: ['performer']
              }
            }
          },
          res = {
            forbidden: sinon.spy()
          },
          next = sinon.spy();

      isPerformer(req, res, next);

      assert.isFalse(res.forbidden.called);
      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly())
    });
  });
});