var assert = require('chai').assert,
    sinon  = require('sinon'),
    ownsUserRecord;

describe('ownsUserRecord()', function () {
  before(function () {
    ownsUserRecord = sails.hooks.policies.middleware.ownsuserrecord;
  });

  context('user model', function () {
    context('other user', function () {
      it('should send a bad request response', function () {
        var req = {
              session: {
                user: 999
              },
              options: {
                model: 'user'
              },
              param  : sinon.stub().withArgs('id').returns('998')
            },
            res = {
              forbidden: sinon.spy()
            },
            next = sinon.spy();

        ownsUserRecord(req, res, next);

        assert.isTrue(res.forbidden.calledOnce);
        assert.isTrue(res.forbidden.calledWithExactly('You are not permitted to perform this action.'));
        assert.isFalse(next.called);
      });
    });

    context('logged in user', function () {
      it('should call next', function () {
        var req = {
              session: {
                user: 999
              },
              options: {
                model: 'user'
              },
              param  : sinon.stub().withArgs('id').returns('999')
            },
            res = {
              forbidden: sinon.spy()
            },
            next = sinon.spy();

        ownsUserRecord(req, res, next);

        assert.isFalse(res.forbidden.called);
        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());
      });
    });
  });

  context('other model', function () {
    context('owned by other user', function () {
      it('should send a bad request response', function () {
        var req = {
              session: {
                user: 999
              },
              options: {
                model: 'message'
              },
              param  : sinon.stub().withArgs('user').returns('998')
            },
            res = {
              forbidden: sinon.spy()
            },
            next = sinon.spy();

        ownsUserRecord(req, res, next);

        assert.isTrue(res.forbidden.calledOnce);
        assert.isTrue(res.forbidden.calledWithExactly('You are not permitted to perform this action.'));
        assert.isFalse(next.called);
      });
    });

    context('owned by logged in user', function () {
      it('should call next', function () {
        var req = {
              session: {
                user: 999
              },
              options: {
                model: 'message'
              },
              param  : sinon.stub().withArgs('user').returns('999')
            },
            res = {
              forbidden: sinon.spy()
            },
            next = sinon.spy();

        ownsUserRecord(req, res, next);

        assert.isFalse(res.forbidden.called);
        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());
      });
    });
  });
});
