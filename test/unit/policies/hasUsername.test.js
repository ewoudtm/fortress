var assert      = require('chai').assert,
    sinon       = require('sinon'),
    hasUsername;

describe('hasUsername()', function () {
  before(function () {
    hasUsername = sails.hooks.policies.middleware.hasusername;
  });

  context('no logged in user', function () {
    it('should send a bad request response', function () {
      var req = {
            session: {}
          },
          res = {
            badRequest: sinon.spy()
          },
          next = sinon.spy();

      hasUsername(req, res, next);

      assert.isTrue(res.badRequest.calledOnce);
      assert.isTrue(res.badRequest.calledWithExactly('missing_username', 'A username is required for this feature.'));
      assert.isFalse(next.called)
    });
  });

  context('no username', function () {
    it('should send a bad request response', function () {
      var req = {
            session: {
              userInfo: {}
            }
          },
          res = {
            badRequest: sinon.spy()
          },
          next = sinon.spy();

      hasUsername(req, res, next);

      assert.isTrue(res.badRequest.calledOnce);
      assert.isTrue(res.badRequest.calledWithExactly('missing_username', 'A username is required for this feature.'));
      assert.isFalse(next.called)
    });
  });

  context('username exists', function () {
    it('should call next', function () {
      var req = {
            session: {
              userInfo: {
                username: 'fixturetest'
              }
            }
          },
          res = {
            badRequest: sinon.spy()
          },
          next = sinon.spy();

      hasUsername(req, res, next);

      assert.isFalse(res.badRequest.called);
      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly())
    });
  });
});