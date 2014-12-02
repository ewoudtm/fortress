var assert      = require('chai').assert,
    sinon       = require('sinon'),
    setVersion;

describe('setVersion()', function () {
  before(function () {
    setVersion = sails.hooks.policies.middleware.setversion;
  });

  context('socket.io connection', function () {
    it('should set the api version from req.socket.__api_version', function () {
      var req = {
            isSocket: true,
            socket: {
              __api_version: '1.2.3'
            }
          },
          res = {},
          next = sinon.spy();

      setVersion(req, res, next);

      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly());

      assert.strictEqual(req.apiVersion, '1.2.3');
    });
  });

  context('http request', function () {
    it('should set the api version from __api_version param', function () {
      var req = {
            param: sinon.stub().withArgs('__api_version').returns('1.2.3'),
            body: {},
            query: {}
          },
          res = {},
          next = sinon.spy();

      setVersion(req, res, next);

      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly());

      assert.strictEqual(req.apiVersion, '1.2.3');
    });

    context('__api_version set in req.body', function () {
      it('should remove the version from body', function () {
        var req = {
              param: sinon.stub().withArgs('__api_version').returns('1.2.3'),
              body: {
                __api_version: '1.2.3'
              },
              query: {}
            },
            res = {},
            next = sinon.spy();

        setVersion(req, res, next);

        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());

        assert.isUndefined(req.body.__api_version);
      });
    });

    context('__api_version set in req.query', function () {
      it('should remove the version from query', function () {
        var req = {
              param: sinon.stub().withArgs('__api_version').returns('1.2.3'),
              body: {},
              query: {
                __api_version: '1.2.3'
              }
            },
            res = {},
            next = sinon.spy();

        setVersion(req, res, next);

        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());

        assert.isUndefined(req.query.__api_version);
      });
    });
  });
});
