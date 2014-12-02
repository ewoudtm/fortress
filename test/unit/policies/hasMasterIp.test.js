var assert      = require('chai').assert,
    sinon       = require('sinon'),
    hasMasterIp;

describe('hasMasterIp()', function () {
  before(function () {
    hasMasterIp = sails.hooks.policies.middleware.hasmasterip;
  });

  context('req.ip is not in master ips', function () {
    it('should send a forbidden response', function () {
      var req = {
            ip: '1.2.3.4'
          },
          res = {
            forbidden: sinon.spy()
          },
          next = sinon.spy();

      hasMasterIp(req, res, next);

      assert.isTrue(res.forbidden.calledOnce);
      assert.isTrue(res.forbidden.calledWithExactly('You are not permitted to perform this action on ip 1.2.3.4'));
      assert.isFalse(next.called)
    });
  });

  context('req.ip is in master ips', function () {
    it('should call next', function () {
      var req = {
            ip: '127.0.0.1'
          },
          res = {
            forbidden: sinon.spy()
          },
          next = sinon.spy();

      hasMasterIp(req, res, next);

      assert.isFalse(res.forbidden.called);
      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly())
    });
  });
});
