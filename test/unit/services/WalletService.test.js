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
