var assert      = require('chai').assert,
    sinon       = require('sinon'),
    setPartnerInfo;

describe('setPartnerInfo()', function () {
  before(function () {
    setPartnerInfo = sails.hooks.policies.middleware.setpartnerinfo;
  });

  context('partnerInfo set as param', function () {
    context('partnerInfo.partnerInfo not set', function () {
      it('should set partnerInfo.partnerInfo from req.object', function () {
        var req = {
              param: sinon.stub().withArgs('partnerInfo').returns({partnerCode: 123}),
              object: {
                partnerCode: 124,
                partnerInfo: 'somePartner'
              }
            },
            res = {},
            next = sinon.spy();

        setPartnerInfo(req, res, next);

        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());

        assert.deepEqual(req.partnerInfo, {
          partnerCode: 123,
          partnerInfo: 'somePartner'
        });
      });
    });

    context('partnerInfo.partnerCode not set', function () {
      it('should set partnerInfo.partnerCode from req.object', function () {
        var req = {
              param: sinon.stub().withArgs('partnerInfo').returns({partnerInfo: 'otherPartner'}),
              object: {
                partnerCode: 124,
                partnerInfo: 'somePartner'
              }
            },
            res = {},
            next = sinon.spy();

        setPartnerInfo(req, res, next);

        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());

        assert.deepEqual(req.partnerInfo, {
          partnerCode: 124,
          partnerInfo: 'otherPartner'
        });
      });
    });

    context('both given', function () {
      it('should not override them from req.object', function () {
        var req = {
              param: sinon.stub().withArgs('partnerInfo').returns({
                partnerCode: 123,
                partnerInfo: 'otherPartner'
              }),
              object: {
                partnerCode: 124,
                partnerInfo: 'somePartner'
              }
            },
            res = {},
            next = sinon.spy();

        setPartnerInfo(req, res, next);

        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());

        assert.deepEqual(req.partnerInfo, {
          partnerCode: 123,
          partnerInfo: 'otherPartner'
        });
      });
    });

    context('partnerInfo set in req.query', function () {
      it('should remove req.query.partnerInfo', function () {
        var req = {
              param: sinon.stub().withArgs('partnerInfo').returns({}),
              object: {},
              query: {
                partnerInfo: {}
              }
            },
            res = {},
            next = sinon.spy();

        setPartnerInfo(req, res, next);

        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());

        assert.isUndefined(req.query.partnerInfo);
      });
    });

    context('partnerInfo set in req.body', function () {
      it('should remove req.body.partnerInfo', function () {
        var req = {
              param: sinon.stub().withArgs('partnerInfo').returns({}),
              object: {},
              body: {
                partnerInfo: {}
              }
            },
            res = {},
            next = sinon.spy();

        setPartnerInfo(req, res, next);

        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());

        assert.isUndefined(req.body.partnerInfo);
      });
    });

    context('partnerInfo set in req.params', function () {
      it('should remove req.params.partnerInfo', function () {
        var req = {
              param: sinon.stub().withArgs('partnerInfo').returns({}),
              object: {},
              params: {
                partnerInfo: {}
              }
            },
            res = {},
            next = sinon.spy();

        setPartnerInfo(req, res, next);

        assert.isTrue(next.calledOnce);
        assert.isTrue(next.calledWithExactly());

        assert.isUndefined(req.params.partnerInfo);
      });
    });
  });

  context('partnerInfo via object', function() {
    it('should set partnerInfo from req.object', function () {
      var req = {
            param: sinon.stub(),
            object: {
              partnerCode: 124,
              partnerInfo: 'somePartner'
            }
          },
          res = {},
          next = sinon.spy();

      setPartnerInfo(req, res, next);

      assert.isTrue(next.calledOnce);
      assert.isTrue(next.calledWithExactly());

      assert.deepEqual(req.partnerInfo, {
        partnerCode: 124,
        partnerInfo: 'somePartner'
      });
    });
  });
});
