var assert = require('chai').assert;

describe('HashService', function () {
  describe('.getSalt()', function () {
    it('Should set the salt.', function () {
      var hashservice = sails.services.hashservice;
      assert.strictEqual(hashservice.getSalt(), sails.config.wallet.salt);
    });
  });

  describe('.setSalt()', function () {
    it('Should set the salt.', function () {
      var hashservice = sails.services.hashservice;
      hashservice.setSalt('zout');
      assert.strictEqual(hashservice.getSalt(), 'zout');
    });
  });

  describe('.generateLoginHash()', function () {
    context('unsafe', function() {
      it('Should generate a login hash without url encoding hash.', function () {
        var hashservice = sails.services.hashservice;
        hashservice.setSalt('zout');
        assert.strictEqual(hashservice.generateLoginHash('test@islive.nl'), 'U+84DmYr77ZxQYsNhxgryA');
      });
    });

    context('safe', function() {
      it('Should generate a login hash with url enconding hash.', function () {
        var hashservice = sails.services.hashservice;
        hashservice.setSalt('zout');
        assert.strictEqual(hashservice.generateLoginHash('test@islive.nl', true), 'U%2B84DmYr77ZxQYsNhxgryA');
      });
    });
  });

  describe('.encode()', function () {
    it('Should generate a hash.', function () {
      var hashservice = sails.services.hashservice;
      hashservice.setSalt('zout');
      assert.strictEqual(hashservice.encode('test@islive.nl'), 'U+84DmYr77ZxQYsNhxgryA');
    });
  });

  describe('.verifyLoginHash()', function () {
    context('wrong hash', function() {
      it('Should return false.', function () {
        var hashservice = sails.services.hashservice;
        hashservice.setSalt('zout');
        assert.isFalse(hashservice.verifyLoginHash('test@islive.nl', 'U+84DmYr77ZxQYsnhxgryA'));
      });
    });

    context('correct hash', function() {
      it('Should return true.', function () {
        var hashservice = sails.services.hashservice;
        hashservice.setSalt('zout');
        assert.isFalse(hashservice.verifyLoginHash('test@islive.nl', 'U+84DmYr77ZxQYsNhxgryA'));
      });
    });
  });
});
