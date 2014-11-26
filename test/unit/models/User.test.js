var assert = require('chai').assert,
    bcrypt = require('bcrypt');

describe('UserModel', function () {
  describe('.getValidRoles()', function () {
    it('should return the valid roles.', function (done) {
      var validRoles = ['visitor', 'performer'];

      assert.deepEqual(sails.models.user.getValidRoles(), validRoles);

      done();
    });
  });

  describe('.update()', function () {
    context('password supplied', function () {
      it('Should hash the password', function (done) {
        sails.models.user.findOne(999, function (error, user) {
          assert.isNull(error);
          bcrypt.compare('keeshond', user.password, function (error, passwordIsValid) {
            assert.isUndefined(error);
            assert.isTrue(passwordIsValid);
            user.password = 'something else';
            user.save(function (error, user) {
              assert.isNull(error);
              bcrypt.compare('something else', user.password, function (error, passwordIsValid) {
                assert.isUndefined(error);
                assert.isTrue(passwordIsValid);
                done();
              });
            });
          });
        });
      });
      it('Should update the password in wallet', function (done) {
        var walletservice = sails.services.walletservice,
          email = 'fortress-test+changepass@ratus.nl',
          credentials = {
            username: '____changepass',
            email   : email,
            password: 'keeshond',
            object  : 1,
            from_url: 'test.net',
            ip      : '127.0.0.1',
            p       : 123,
            pi      : 'testing'
          },
          walletUser;

        async.series({
          resetWalletPassword: function (callback) {
            walletservice.remoteChangePassword(email, 'keeshond',
            sails.services.hashservice.generateLoginHash(email),
            function (error, success) {
              assert.isNull(error);
              assert.isTrue(success);
              callback();
            });
          },
          importWalletUser: function (callback) {
            walletservice.importUser(credentials, function (error, user) {
              walletUser = user;
              assert.isNull(error);
              assert.isNotNull(walletUser);
              assert.isObject(walletUser);
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
          changeUserPassword: function (callback) {
            walletUser.password = 'something else';
            walletUser.save(function (error, user) {
              walletUser = user;
              assert.isNull(error);
              callback();
            });
          },
          compareUserPassword: function (callback) {
            bcrypt.compare('something else', walletUser.password, function (error, passwordIsValid) {
              assert.isUndefined(error);
              assert.isTrue(passwordIsValid);
              callback();
            });
          },
          walletLoginWithNewPassword: function (callback) {
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
});
