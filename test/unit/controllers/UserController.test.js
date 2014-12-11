var request = require('supertest'),
    assert  = require('chai').assert,
    sinon   = require('sinon');

describe('UserController', function () {
  describe('.getUsername(): GET /user/username/:id', function () {
    it('should return the username for our test user', function (done) {

      var testUserId = 999;

      request(sails.hooks.http.app)
        .get('/user/username/' + testUserId)
        .set('Content-Type', 'application/json')
        .set('X-Object-Host', 'api.islive.io')
        .expect('Content-Type', /json/)
        .expect(function (res) {
          assert.property(res.body, 'username', 'Username returned');
          assert.strictEqual(res.body.username, 'fixturetest', 'Username equals "fixturetest"');
        })
        .expect(200, done);
    })
  });

  describe('.verify(): GET /user/:id/verify/:type?hash=', function () {

    var userId = 998;

    it('Should set the emailVerified flag on the User model to true', function (done) {
      request(sails.hooks.http.app)
        .get('/user/' + userId + '/verify/email/?hash=e75586fc39bf3a782082c0151b998602')
        .set('Content-Type', 'application/json')
        .set('X-Object-Host', 'api.islive.io')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (error) {
          assert.isNull(error, 'Request failed.');

          sails.models.user.findOne(userId, function (error, user) {
            assert.isNull(error, 'Fetching user failed.');
            assert.isNotNull(user, 'No user found.');
            assert.isTrue(user.emailVerified, 'Email wasn\'t verified');

            done();
          });
        });
    });

    it('Should set the notificationEmailVerified flag on the User model to true', function (done) {
      request(sails.hooks.http.app)
        .get('/user/' + userId + '/verify/notification-email/?hash=c750f197c6dccea4cf5adfb713ad5e1f')
        .set('Content-Type', 'application/json')
        .set('X-Object-Host', 'api.islive.io')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (error) {
          assert.isNull(error, 'Request failed.');

          sails.models.user.findOne(userId, function (error, user) {
            assert.isNull(error, 'Fetching user failed.');
            assert.isNotNull(user, 'No user found.');
            assert.isTrue(user.notificationEmailVerified, 'NotificationEmail wasn\'t verified');

            done();
          });
        });
    });
  });

  describe('.update(): PUT /user/:id', function () {
    it('Should set a property and return the object for our test user', function (done) {

      var requestHook = request(sails.hooks.http.app),
          testUserId = 999,
          newValues = {
            mailable   : false,
            UnknownProp: '.|.'
          },
          credentials = {
            role    : 'visitor',
            username: 'fixture-test@islive.io',
            password: 'keeshond'
          };

      requestHook
        .post('/user/login')
        .send(credentials)
        .end(function (err, res) {
          assert.isFalse(res.error, "User login failed");
          assert.strictEqual(res.status, 200, 'Request was invalid');

          requestHook
            .put('/user/' + testUserId)
            .set('cookie', res.headers['set-cookie'])
            .send(newValues)
            .end(function (err, user) {
              assert.strictEqual(user.status, 200, 'Request was invalid');
              assert.isUndefined(user.body.UnknownProp, 'UnknownProp should not be updated because the property is not set in the model');
              assert.strictEqual(user.body.mailable, newValues.mailable, 'Mailable does not equal "' + newValues.mailable + '"');

              done();
            });
        });
    });

    it('Should attempt to change the username, but fail because it is not whitelisted', function (done) {
      var requestHook = request(sails.hooks.http.app),
          testUserId = 999,
          newValues = {
            username: 'Bob'
          },
          credentials = {
            role    : 'visitor',
            username: 'fixture-test@islive.io',
            password: 'keeshond'
          };

      requestHook
        .post('/user/login')
        .send(credentials)
        .end(function (err, res) {
          assert.isFalse(res.error, "User login failed");
          assert.strictEqual(res.status, 200, 'Request was invalid');

          requestHook
            .put('/user/' + testUserId)
            .set('cookie', res.headers['set-cookie'])
            .send(newValues)
            .end(function (err, user) {
              assert.strictEqual(user.status, 200, 'Request was invalid');
              assert.isUndefined(user.body.UnknownProp, 'UnknownProp should not be updated because the property is not set in the model');
              assert.strictEqual(user.body.username, 'fixturetest', 'Username does not equal fixturetest');

              done();
            });
        });
    });
  });

  describe('.updatePassword(): PUT /user/password', function () {
    before(function () {
      var stub = sinon.stub(sails.services.hashservice, 'encode');

      stub.withArgs('fortress-test+changepass@ratus.nl').returns('KWEzk8U5tw0iN3/dAfQ0Wg')
    });

    after(function () {
      sails.services.hashservice.encode.restore();
    });

    context('not skipping wallet update', function () {
      it('Should update the password in the user and the wallet', function (done) {
        var requestHook = request(sails.hooks.http.app),
            walletservice = sails.services.walletservice,
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
          resetWalletPassword            : function (callback) {
            walletservice.remoteChangePassword(email, 'keeshond',
              sails.services.hashservice.generateLoginHash(email),
              function (error, success) {
                assert.isNull(error);
                assert.isTrue(success, 'Resetting password failed.');
                callback();
              });
          },
          importWalletUser               : function (callback) {
            sails.models.user.destroy({username: '____changepass'}, function (error) {
              assert.isNull(error);
              walletservice.importUser(credentials, function (error, user) {
                walletUser = user;
                assert.isNull(error);
                assert.isNotNull(walletUser);
                assert.isObject(walletUser);
                callback();
              });
            });
          },
          walletLogInWithOriginalPassword: function (callback) {
            walletservice.login({
              username: email,
              password: 'keeshond'
            }, function (error, success) {
              assert.isNull(error);
              assert.isTrue(success, 'Logging in with origin password failed.');
              callback();
            });
          },
          changeUserPassword             : function (callback) {
            requestHook
              .post('/user/login')
              .send({
                role    : 'visitor',
                username: email,
                password: 'keeshond'
              })
              .end(function (error, res) {
                assert.isNull(error);
                assert.isFalse(res.error, "User login failed");
                assert.strictEqual(res.status, 200, 'Request was invalid');
                requestHook
                  .put('/user/password')
                  .set('cookie', res.headers['set-cookie'])
                  .send({password: 'something else'})
                  .end(function (error, response) {
                    assert.isNull(error);
                    assert.strictEqual(response.status, 200, 'Request was invalid');
                    callback();
                  });
              });
          },
          fortressLoginWithNewPassword   : function (callback) {
            requestHook
              .post('/user/login')
              .send({
                role    : 'visitor',
                username: email,
                password: 'something else'
              })
              .end(function (error, res) {
                assert.isNull(error);
                assert.isFalse(res.error, "User login failed");
                assert.strictEqual(res.status, 200, 'Request was invalid');
                callback();
              });
          },
          walletLoginWithNewPassword     : function (callback) {
            walletservice.login({
              username: email,
              password: 'something else'
            }, function (error, success) {
              assert.isNull(error);
              assert.isTrue(success, 'Logging in with new password failed.');
              callback();
            });
          }
        }, done);
      });
    });

    context('skipping wallet update', function () {
      it('Should update the password in the user', function (done) {
        var requestHook = request(sails.hooks.http.app),
            walletservice = sails.services.walletservice,
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
          resetWalletPassword            : function (callback) {
            walletservice.remoteChangePassword(email, 'keeshond',
              sails.services.hashservice.generateLoginHash(email),
              function (error, success) {
                assert.isNull(error);
                assert.isTrue(success, 'Resetting password failed.');
                callback();
              });
          },
          importWalletUser               : function (callback) {
            sails.models.user.destroy({username: '____changepass'}, function (error) {
              assert.isNull(error);
              walletservice.importUser(credentials, function (error, user) {
                walletUser = user;
                assert.isNull(error);
                assert.isNotNull(walletUser);
                assert.isObject(walletUser);
                callback();
              });
            });
          },
          walletLogInWithOriginalPassword: function (callback) {
            walletservice.login({
              username: email,
              password: 'keeshond'
            }, function (error, success) {
              assert.isNull(error);
              assert.isTrue(success, 'Logging in with origin password failed.');
              callback();
            });
          },
          changeUserPassword             : function (callback) {
            requestHook
              .post('/user/login')
              .send({
                role    : 'visitor',
                username: email,
                password: 'keeshond'
              })
              .end(function (error, res) {
                assert.isNull(error);
                assert.isFalse(res.error, "User login failed");
                assert.strictEqual(res.status, 200, 'Request was invalid');
                requestHook
                  .put('/user/password')
                  .set('cookie', res.headers['set-cookie'])
                  .send({
                    password  : 'something else',
                    skipWallet: true
                  })
                  .end(function (error, response) {
                    assert.isNull(error);
                    assert.strictEqual(response.status, 200, 'Request was invalid');
                    callback();
                  });
              });
          },
          fortressLoginWithNewPassword   : function (callback) {
            requestHook
              .post('/user/login')
              .send({
                role    : 'visitor',
                username: email,
                password: 'something else'
              })
              .end(function (error, res) {
                assert.isNull(error);
                assert.isFalse(res.error, "User login failed");
                assert.strictEqual(res.status, 200, 'Request was invalid');
                callback();
              });
          },
          walletLoginWithNewPassword     : function (callback) {
            walletservice.login({
              username: email,
              password: 'something else'
            }, function (error, success) {
              assert.isNull(error);
              assert.isFalse(success, 'Logging in with new password succeeded.');
              callback();
            });
          }
        }, done);
      });
    });
  });

  describe('.getIdentity(): GET /user/identity/:role?', function () {
    context('role not specified', function () {
      it('Should return the user without populated identity.', function (done) {
        var requestHook = request(sails.hooks.http.app),
            credentials = {
              role    : 'visitor',
              username: 'fixture-test@islive.io',
              password: 'keeshond'
            };

        requestHook
          .post('/user/login')
          .send(credentials)
          .end(function (error, res) {
            assert.isFalse(res.error, "User login failed");
            assert.strictEqual(res.status, 200, 'Request was invalid');
            requestHook
              .get('/user/identity')
              .set('cookie', res.headers['set-cookie'])
              .end(function (error, res) {
                var user = res.body;
                assert.isNull(error);
                assert.strictEqual(user.visitor, 888);
                done();
              });
          });
      });
    });

    context('visitor role specified', function () {
      it('Should return the user without populated identity.', function (done) {
        var requestHook = request(sails.hooks.http.app),
            credentials = {
              role    : 'visitor',
              username: 'fixture-test@islive.io',
              password: 'keeshond'
            };

        requestHook
          .post('/user/login')
          .send(credentials)
          .end(function (error, res) {
            assert.isFalse(res.error, "User login failed");
            assert.strictEqual(res.status, 200, 'Request was invalid');
            requestHook
              .get('/user/identity/visitor')
              .set('cookie', res.headers['set-cookie'])
              .end(function (error, res) {
                var user = res.body;
                assert.isNull(error);
                assert.strictEqual(user.visitor.id, 888);
                done();
              });
          });
      });
    });

    context('performer role specified', function () {
      it('Should return the user without populated identity.', function (done) {
        var requestHook = request(sails.hooks.http.app),
            credentials = {
              role    : 'performer',
              username: 'event.handler.performer@islive.io',
              password: 'keeshond'
            };

        requestHook
          .post('/user/login')
          .send(credentials)
          .end(function (error, res) {
            assert.isFalse(res.error, "User login failed");
            assert.strictEqual(res.status, 200, 'Request was invalid');
            requestHook
              .get('/user/identity/performer')
              .set('cookie', res.headers['set-cookie'])
              .end(function (error, res) {
                var user = res.body;
                assert.isNull(error);
                assert.strictEqual(user.performer.id, 555);
                done();
              });
          });
      });
    });

    context('missing role specified', function () {
      it('Should return bad request.', function (done) {
        var requestHook = request(sails.hooks.http.app),
            credentials = {
              role    : 'visitor',
              username: 'fixture-test@islive.io',
              password: 'keeshond'
            };

        requestHook
          .post('/user/login')
          .send(credentials)
          .end(function (error, res) {
            assert.isFalse(res.error, "User login failed");
            assert.strictEqual(res.status, 200, 'Request was invalid');
            requestHook
              .get('/user/identity/performer')
              .set('cookie', res.headers['set-cookie'])
              .end(function (error, res) {
                var user = res.body;
                assert.isNull(error);
                assert.strictEqual(res.status, 400);
                assert.strictEqual(res.body.error, 'missing_role');
                done();
              });
          });
      });
    });

    context('non-existent role specified', function () {
      it('Should return bad request.', function (done) {
        var requestHook = request(sails.hooks.http.app),
            credentials = {
              role    : 'visitor',
              username: 'fixture-test@islive.io',
              password: 'keeshond'
            };

        requestHook
          .post('/user/login')
          .send(credentials)
          .end(function (error, res) {
            assert.isFalse(res.error, "User login failed");
            assert.strictEqual(res.status, 200, 'Request was invalid');
            requestHook
              .get('/user/identity/abuser')
              .set('cookie', res.headers['set-cookie'])
              .end(function (error, res) {
                var user = res.body;
                assert.isNull(error);
                assert.strictEqual(res.status, 400);
                assert.strictEqual(res.body.error, 'invalid_role');
                done();
              });
          });
      });
    });
  });

  describe('.unsubscribe(): GET /user/:id/unsubscribe', function () {
    context('invalid hash', function () {
      it('Should return bad request.', function (done) {
        request(sails.hooks.http.app)
          .get('/user/994/unsubscribe?hash=dac554280f50dd6b4d784620d373e7f8')
          .expect(400)
          .end(done);
      });
    });
    context('valid hash', function () {
      it('Should unsubscribe the user from mailing.', function (done) {
        var userModel = sails.models.user;

        userModel.findOne(994, function (error, user) {
          var hash;

          assert.isNull(error);
          assert.isTrue(user.mailable);
          hash = sails.services.userservice.generateHash(user);

          request(sails.hooks.http.app)
            .get('/user/994/unsubscribe?hash=' + hash)
            .expect(200)
            .end(function (error) {
              assert.isNull(error);

              userModel.findOne(994, function (error, user) {
                assert.isFalse(user.mailable);
                done();
              });
            });
        });
      });
    });
  });

  describe('.usernameAvailable(): POST /user/username-available', function () {
    context('username is available', function () {
      it('Should return available', function (done) {
        request(sails.hooks.http.app)
          .post('/user/username-available')
          .send({username: 'available.username'})
          .expect(200)
          .end(function (error, response) {
            assert.isNull(error);
            assert.isTrue(response.body.available);
            done();
          });
      });
    });

    context('username is not available', function () {
      it('Should return unavailable', function (done) {
        request(sails.hooks.http.app)
          .post('/user/username-available')
          .send({username: 'fixturetest'})
          .expect(200)
          .end(function (error, response) {
            assert.isNull(error);
            assert.isFalse(response.body.available);
            done();
          });
      });
    });

    context('username is not specified', function () {
      it('Should return bad request', function (done) {
        request(sails.hooks.http.app)
          .post('/user/username-available')
          .expect(400)
          .end(done);
      });
    });
  });

  describe('.login() POST /user/login', function () {
    context('no credentials', function () {
      it('Should return bad request', function (done) {
        request(sails.hooks.http.app)
          .post('/user/login')
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'missing_parameter');
            done();
          });
      });
    });

    context('no role', function () {
      it('Should return bad request', function (done) {
        request(sails.hooks.http.app)
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond'
          })
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'missing_parameter');
            done();
          });
      });
    });

    context('invalid role', function () {
      it('Should return bad request', function (done) {
        request(sails.hooks.http.app)
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond',
            role    : 'abuser'
          })
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'invalid_parameter');
            done();
          });
      });
    });

    context('invalid password', function () {
      it('Should return bad request', function (done) {
        request(sails.hooks.http.app)
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshondje',
            role    : 'visitor'
          })
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'invalid_credentials');
            done();
          });
      });
    });

    context('missing role for user', function () {
      it('Should return bad request', function (done) {
        request(sails.hooks.http.app)
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshondje',
            role    : 'performer'
          })
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'missing_role');
            done();
          });
      });
    });

    context('valid credentials', function () {
      it('Should authenticate and return the user', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond',
            role    : 'visitor'
          })
          .expect(200)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.id, 999);
            requestHook
              .get('/user/identity')
              .set('cookie', response.headers['set-cookie'])
              .expect(200, done);
          });
      });
    });
  });

  describe('.loginByHash() POST /user/login-by-hash', function () {
    context('no credentials', function () {
      it('Should return bad request', function (done) {
        request(sails.hooks.http.app)
          .post('/user/login-by-hash')
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'missing_parameter');
            done();
          });
      });
    });

    context('no role', function () {
      it('Should return bad request', function (done) {
        var loginHash = sails.services.hashservice.generateLoginHash('fixture-test@islive.io');

        request(sails.hooks.http.app)
          .post('/user/login-by-hash')
          .send({
            email: 'fixture-test@islive.io',
            hash : loginHash
          })
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'missing_parameter');
            done();
          });
      });
    });

    context('invalid role', function () {
      it('Should return bad request', function (done) {
        var loginHash = sails.services.hashservice.generateLoginHash('fixture-test@islive.io');

        request(sails.hooks.http.app)
          .post('/user/login-by-hash')
          .send({
            email: 'fixture-test@islive.io',
            hash : loginHash,
            role : 'abuser'
          })
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'invalid_parameter');
            done();
          });
      });
    });

    context('invalid hash', function () {
      it('Should return bad request', function (done) {
        request(sails.hooks.http.app)
          .post('/user/login-by-hash')
          .send({
            email: 'fixture-test@islive.io',
            hash : 'sUS7SFkNQv0Xp29SIofOrg',
            role : 'visitor'
          })
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'invalid_credentials');
            done();
          });
      });
    });

    context('missing role for user', function () {
      it('Should return bad request', function (done) {
        var loginHash = sails.services.hashservice.generateLoginHash('fixture-test@islive.io');

        request(sails.hooks.http.app)
          .post('/user/login-by-hash')
          .send({
            email: 'fixture-test@islive.io',
            hash : loginHash,
            role : 'performer'
          })
          .expect(400)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.error, 'missing_role');
            done();
          });
      });
    });

    context('valid credentials', function () {
      it('Should authenticate and return the user', function (done) {
        var requestHook = request(sails.hooks.http.app),
            loginHash = sails.services.hashservice.generateLoginHash('fixture-test@islive.io');

        requestHook
          .post('/user/login-by-hash')
          .send({
            email: 'fixture-test@islive.io',
            hash : loginHash,
            role : 'visitor'
          })
          .expect(200)
          .end(function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.body.id, 999);
            requestHook
              .get('/user/identity')
              .set('cookie', response.headers['set-cookie'])
              .expect(200, done);
          });
      });
    });
  });

  describe('.logout() GET /user/logout', function () {
    context('user logged in', function () {
      it('Should log out the user', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond',
            role    : 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 999);
            requestHook
              .get('/user/logout')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(200)
              .end(function (error, response) {
                assert.isNull(error);
                requestHook
                  .get('/user/identity')
                  .set('cookie', loginResponse.headers['set-cookie'])
                  .expect(403, done);
              });
          });
      });
    });

    context('user not logged in', function () {
      it('Should return forbidden', function (done) {
        request(sails.hooks.http.app)
          .get('/user/logout')
          .expect(403)
          .end(done);
      });
    });
  });
});
