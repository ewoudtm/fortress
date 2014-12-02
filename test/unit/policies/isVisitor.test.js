var assert      = require('chai').assert,
    sinon       = require('sinon'),
    isVisitor;

describe('isVisitor()', function () {
  before(function () {
    isVisitor = sails.hooks.policies.middleware.isvisitor;
  });

  context('no visitor role', function () {
    it('should send a forbidden response', function () {
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

      isVisitor(req, res, next);

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
                roles: ['visitor']
              }
            }
          },
          res = {
            forbidden: sinon.spy()
          },
          next = sinon.spy();

      isVisitor(req, res, next);

      assert.isFalse(res.forbidden.called);
      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly())
    });
  });
});