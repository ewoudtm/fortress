var assert      = require('chai').assert,
    sinon       = require('sinon'),
    setObject;

describe('setObject()', function () {
  before(function () {
    setObject = sails.hooks.policies.middleware.setobject;
  });

  context('not resolvable by ip', function () {
    context('socket.io connection', function () {
      it('should return bad request and not set req.object', function (done) {
        var req = {
              isSocket: true,
              socket: {
                host: '1.2.3.4'
              }
            },
            res = {
              badRequest: function () {
                assert.isFalse(next.called);
                assert.isTrue(res.badRequest.calledOnce);
                assert.isTrue(res.badRequest.calledWithExactly('Unknown object.'));
                assert.isUndefined(req.object);
                done();
              }
            },
            next = sinon.spy();

        sinon.spy(res, 'badRequest');
        setObject(req, res, next);
      });
    });
    context('X-Object-Host header set', function (done) {
      it('should return bad request and not set req.object', function (done) {
        var req = {
              get: sinon.stub().withArgs('X-Object-Host').returns('1.2.3.4')
            },
            res = {
              badRequest: function () {
                assert.isFalse(next.called);
                assert.isTrue(res.badRequest.calledOnce);
                assert.isTrue(res.badRequest.calledWithExactly('Unknown object.'));
                assert.isUndefined(req.object);
                done();
              }
            },
            next = sinon.spy();

        sinon.spy(res, 'badRequest');
        setObject(req, res, next);
      });
    });
  });

  context('resolvable by ip', function () {
    context('socket.io connection',function () {
      it('should set req.object and call next', function (done) {
        var req = {
              isSocket: true,
              socket: {
                host: 'api.islive.io'
              }
            },
            res = {
              badRequest: sinon.spy()
            },
            next = function () {
              var object = req.object;

              assert.isFalse(res.badRequest.called);
              assert.isTrue(next.calledOnce);
              assert.isTrue(next.calledWithExactly());
              assert.strictEqual(object.id, 1);
              assert.strictEqual(object.host, 'api.islive.io');
              assert.strictEqual(object.partnerCode, 123);
              assert.strictEqual(object.partnerInfo, 'testing');
              assert.strictEqual(object.email, 'test@islive.nl');
              done();
            };

        next = sinon.spy(next);
        setObject(req, res, next);
      });
    });
    context('X-Object-Host header set', function () {
      it('should set req.object and call next', function (done) {
        var req = {
              get: sinon.stub().withArgs('X-Object-Host').returns('api.islive.io')
            },
            res = {
              badRequest: sinon.spy()
            },
            next = function () {
              var object = req.object;

              assert.isFalse(res.badRequest.called);
              assert.isTrue(next.calledOnce);
              assert.isTrue(next.calledWithExactly());
              assert.strictEqual(object.id, 1);
              assert.strictEqual(object.host, 'api.islive.io');
              assert.strictEqual(object.partnerCode, 123);
              assert.strictEqual(object.partnerInfo, 'testing');
              assert.strictEqual(object.email, 'test@islive.nl');
              done();
            };

        next = sinon.spy(next);
        setObject(req, res, next);
      });
    });
  });

  context('localhost', function () {
    context('socket.io connection',function () {
      it('should set req.object with the default object and call next', function (done) {
        var req = {
              isSocket: true,
              socket: {
                host: '127.0.0.1'
              }
            },
            res = {
              badRequest: sinon.spy()
            },
            next = function () {
              var object = req.object;

              assert.isFalse(res.badRequest.called);
              assert.isTrue(next.calledOnce);
              assert.isTrue(next.calledWithExactly());
              assert.strictEqual(object.id, 1);
              assert.strictEqual(object.host, 'api.islive.io');
              assert.strictEqual(object.partnerCode, 123);
              assert.strictEqual(object.partnerInfo, 'testing');
              assert.strictEqual(object.email, 'test@islive.nl');
              done();
            };

        next = sinon.spy(next);
        setObject(req, res, next);
      });
    });

    context('X-Object-Host header set', function () {
      it('should set req.object with the default object and call next', function (done) {
        var req = {
              get: sinon.stub().withArgs('X-Object-Host').returns('127.0.0.1')
            },
            res = {
              badRequest: sinon.spy()
            },
            next = function () {
              var object = req.object;

              assert.isFalse(res.badRequest.called);
              assert.isTrue(next.calledOnce);
              assert.isTrue(next.calledWithExactly());
              assert.strictEqual(object.id, 1);
              assert.strictEqual(object.host, 'api.islive.io');
              assert.strictEqual(object.partnerCode, 123);
              assert.strictEqual(object.partnerInfo, 'testing');
              assert.strictEqual(object.email, 'test@islive.nl');
              done();
            };

        next = sinon.spy(next);
        setObject(req, res, next);
      });
    });
  });
});
