var assert = require('chai').assert;

describe('WalletService', function () {
  describe('.importUser()', function () {
    it('Should import a user from mysecurewallet', function (done) {

      var walletService = sails.services.walletservice,
          credentials = {
            username: 'mytest',
            email   : 'fortress-test@ratus.nl',
            password: 'foobar',
            object  : 1,
            from_url: 'test.net',
            ip      : '127.0.0.1',
            p       : 123,
            pi      : 'testing'
          };

      walletService.importUser(credentials, function (error, imported) {
        assert.isNull(error);
        assert.isNotNull(imported);
        assert.isObject(imported);

        done();
      });
    });
  });

  describe('.login()', function () {
    it('Should be able to log in a user over jsonp', function (done) {
      var walletService = sails.services.walletservice;

      var credentials = {
        username: 'fortress-test@ratus.nl',
        password: 'keeshond'
      };

      walletService.login(credentials, function (error, authenticated) {
        assert.isNull(error);
        assert.isTrue(authenticated, 'Invalid credentials.');

        done();
      });
    });
  });
});
