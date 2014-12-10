var assert = require('chai').assert,
    sinon  = require('sinon'),
    ensureParticipation;

describe('ensureParticipation()', function () {
  before(function () {
    ensureParticipation = sails.hooks.policies.middleware.ensureparticipation;
  });

  it('should set req.options based on logged in user and call next', function () {
    var req = {
          options: {},
          session: {user: 999}
        },
        res = {},
        next = sinon.spy();

    ensureParticipation(req, res, next);

    assert.isTrue(next.calledOnce);
    assert.isTrue(next.calledWithExactly());
    assert.deepEqual(req.options, {
      where: {
        or: [
          {to: 999, toArchived: false},
          {from: 999, fromArchived: false}
        ]
      }
    })
  });
});
