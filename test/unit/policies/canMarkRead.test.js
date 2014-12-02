var assert = require('chai').assert,
    sinon  = require('sinon'),
    canMarkRead;

describe('canMarkRead()', function () {
  before(function () {
    canMarkRead = sails.hooks.policies.middleware.canmarkread;
  });

  context('req.path is not /messages/inbox', function () {
    it('should call next', function () {
      var req = {
            route: {
              path: '/thread'
            }
          },
          res = {},
          next = sinon.spy();

      canMarkRead(req, res, next);

      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly());
    });
  });

  context('no session', function () {
    it('should send bad request', function () {
      var req = {
            route: {
              path: '/message/inbox'
            }
          },
          res = {
            badRequest: sinon.spy()
          },
          next = sinon.spy();

      canMarkRead(req, res, next);

      assert.isTrue(res.badRequest.calledOnce);
      assert.isTrue(res.badRequest.calledWithExactly());
      assert.isFalse(next.called);
    });
  });

  context('no logged in user', function () {
    it('should send bad request', function () {
      var req = {
            route  : {
              path: '/message/inbox'
            },
            session: {}
          },
          res = {
            badRequest: sinon.spy()
          },
          next = sinon.spy();

      canMarkRead(req, res, next);

      assert.isTrue(res.badRequest.calledOnce);
      assert.isTrue(res.badRequest.calledWithExactly());
      assert.isFalse(next.called);
    });
  });

  context('with logged in user', function () {
    it('should call next and set a request body for query', function () {
      var req = {
            route  : {
              path: '/message/inbox'
            },
            session: {
              user: 999
            }
          },
          res = {
            badRequest: sinon.spy()
          },
          next = sinon.spy();

      canMarkRead(req, res, next);

      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly());
      assert.deepEqual(req.body, {
        where  : {
          or: [
            {
              to: 999
            },
            {
              from: 999
            }
          ]
        },
        groupBy: 'thread',
        sort   : 'updatedAt desc'
      });
    });
  });
});
