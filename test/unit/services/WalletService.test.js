var assert = require('chai').assert,
    sinon  = require('sinon');

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

    it('Should import a user with a custom programId', function (done) {
      // This test passes because object 7 has `config.wallet.programId` set to "9182"
      var walletService = sails.services.walletservice,
          credentials = {
            username: 'mytest',
            email   : 'fortress-test+program-id@ratus.nl',
            password: 'foobar',
            object  : 7,
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

    it('Should not find a user with a custom programId using the default object', function (done) {
      // This test fails because object 1 doesn't have `config.wallet.programId` set to "9182"
      var walletService = sails.services.walletservice,
          credentials = {
            username: 'mytest',
            email   : 'fortress-test+program-id@ratus.nl',
            password: 'foobar',
            object  : 1,
            from_url: 'test.net',
            ip      : '127.0.0.1',
            p       : 123,
            pi      : 'testing'
          };

      walletService.importUser(credentials, function (error, imported) {
        assert.isNull(error);
        assert.isNull(imported);

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

  describe('.getWalletApiUrl()', function () {
    it('Should change the wallet API url if supplied by object', function (done) {
      var walletService = sails.services.walletservice;

      walletService.getWalletApiUrl('api.otherhost.io', function (error, apiUrl) {
        assert.notOk(error, 'Resolving failed.');
        assert.equal('compare me', apiUrl, 'Did not get the object-specific API url.');

        done();
      });
    });

    it('Should return the default if no object was supplied', function (done) {
      var walletService = sails.services.walletservice;

      walletService.getWalletApiUrl(function (error, apiUrl) {
        assert.notOk(error, 'Resolving failed.');
        assert.equal(sails.config.wallet.apiUrl, apiUrl, 'Did not get the object-specific API url.');

        done();
      });
    });
  });

  describe('.remoteChangePassword()', function () {
    before(function () {
      var stub = sinon.stub(sails.services.hashservice, 'encode');

      stub.withArgs('fortress-test+changepass@ratus.nl').returns('KWEzk8U5tw0iN3/dAfQ0Wg')
    });

    after(function () {
      sails.services.hashservice.encode.restore();
    });

    it('Should change the wallet password', function (done) {
      var walletservice = sails.services.walletservice,
          email = 'fortress-test+changepass@ratus.nl';

      async.series({
        resetWalletPassword            : function (callback) {
          walletservice.changePassword(1, email, 'keeshond',
            function (error, success) {
              assert.isNull(error);
              assert.isTrue(success);
              callback();
            });
        },
        walletLogInWithOriginalPassword: function (callback) {
          walletservice.login({
            username: email,
            password: 'keeshond'
          }, function (error, success) {
            assert.isNull(error);
            assert.isTrue(success);
            callback();
          });
        },
        setNewWalletPassword           : function (callback) {
          walletservice.changePassword(1, email, 'something else',
            function (error, success) {
              assert.isNull(error);
              assert.isTrue(success);
              callback();
            });
        },
        walletLogInWithNewPassword     : function (callback) {
          walletservice.login({
            username: email,
            password: 'something else'
          }, function (error, success) {
            assert.isNull(error);
            assert.isTrue(success);
            callback();
          });
        }
      }, done);
    });
  });
});
