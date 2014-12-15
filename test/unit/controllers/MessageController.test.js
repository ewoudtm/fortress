var request = require('supertest'),
    assert  = require('chai').assert;

describe('MessageController', function () {
  describe('.create(): POST /message', function () {
    context('no user logged in', function () {
      it('should return forbidden', function (done) {
        request(sails.hooks.http.app)
          .post('/message')
          .expect(403)
          .end(done);
      });
    });

    context('user without username logged in', function () {
      it('should return bad request', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test+nousername@islive.io',
            password: 'keeshond',
            role    : 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 992);
            requestHook
              .post('/message')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(400)
              .end(function (error, response) {
                assert.isNull(error);
                assert.strictEqual(response.body.error, 'missing_username')
                done();
              });
          });
      });
    });

    context('missing attributes', function () {
      it('should return bad request', function (done) {
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
            request(sails.hooks.http.app)
              .post('/message')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(400)
              .end(done);
          });
      });
    });

    context('visitor logged in', function () {
      it('should return ok and create a message', function (done) {
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
              .post('/message')
              .send({
                title : 'New message',
                body  : 'New message body',
                to    : 998,
                thread: 4
              })
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(200)
              .end(function (error, response) {
                var message = response.body;

                assert.isNull(error);
                assert.strictEqual(message.title, 'New message');
                assert.strictEqual(message.body, 'New message body');
                assert.strictEqual(message.to, 998);
                assert.strictEqual(message.thread, 4);
                done();
              });
          });
      });
    });

    context('visitor with not enough credit logged in', function () {
      it('should return bad request', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test+fiftycent@islive.io',
            password: 'keeshond',
            role    : 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 991);
            request(sails.hooks.http.app)
              .post('/message')
              .send({
                title : 'New message',
                body  : 'New message body',
                to    : 998,
                thread: 4
              })
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(400)
              .end(function (error, response) {
                assert.isNull(error);
                assert.strictEqual(response.body.error, 'insufficient_funds')
                done();
              });
          });
      });
    });

    context('performer logged in', function () {
      it('should return ok and create a message', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .set('X-Object-Host', 'mock.event.handler.islive.io')
          .send({
            username: 'event.handler.performer@islive.io',
            password: 'keeshond',
            role    : 'performer'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 996);
            request(sails.hooks.http.app)
              .post('/message')
              .send({
                title : 'New message',
                body  : 'New message body',
                to    : 999,
                thread: 4
              })
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(200)
              .end(function (error, response) {
                var message = response.body;

                assert.isNull(error);
                assert.strictEqual(message.title, 'New message');
                assert.strictEqual(message.body, 'New message body');
                assert.strictEqual(message.to, 999);
                assert.strictEqual(message.thread, 4);
                done();
              });
          });
      });
    });
  });

  describe('.inbox(): GET /message/inbox', function () {
    context('no user logged in', function () {
      it('should return forbidden', function (done) {
        request(sails.hooks.http.app)
          .get('/message/inbox')
          .expect(403)
          .end(done);
      });
    });

    context('user logged in', function () {
      it('should return the messages from and to the user', function (done) {
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
            request(sails.hooks.http.app)
              .get('/message/inbox')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(200)
              .end(function (error, response) {
                var messages = response.body,
                    message = messages[0];

                assert.isNull(error);
                assert.strictEqual(messages.length, 4);
                assert.strictEqual(message._modelName, 'inbox');
                assert.isDefined(message.id);
                assert.strictEqual(message.from, 'fixturetest');
                assert.strictEqual(message.to, 'murdercow');
                assert.strictEqual(message.subject, 'Test subject 4');
                assert.strictEqual(message.thread, 4);
                assert.strictEqual(message.body, 'New message body');
                assert.strictEqual(message.read, false);
                assert.strictEqual(message.direction, 'in');
                assert.strictEqual(message.participant, 996);
                assert.isDefined(message.created);
                assert.isDefined(message.updated);
                done();
              });
          });
      });
    });
  });

  describe('.markRead(): PUT /message/mark-read', function () {
    context('no user logged in', function () {
      it('should return forbidden', function (done) {
        request(sails.hooks.http.app)
          .put('/message/mark-read')
          .expect(403)
          .end(done);
      });
    });

    context('user logged in', function () {
      context('no id set', function () {
        it('should return bad request', function (done) {
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
              request(sails.hooks.http.app)
                .put('/message/mark-read')
                .set('cookie', loginResponse.headers['set-cookie'])
                .expect(400)
                .end(function (error, response) {
                  assert.isNull(error);
                  assert.strictEqual(response.body.error, 'missing_parameter');
                  done();
                });
            });
        });
      });

      context('id set', function () {
        it('should return ok and set read to true on the message', function (done) {
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
              request(sails.hooks.http.app)
                .put('/message/mark-read')
                .send({id: 5})
                .set('cookie', loginResponse.headers['set-cookie'])
                .expect(200)
                .end(function (error, response) {
                  assert.isNull(error);
                  sails.models.message.findOne({id: 5}, function (error, message) {
                    assert.isNull(error);
                    assert.strictEqual(message.read, true);
                    done();
                  });
                });
            });
        });
      });
    });
  });

  describe('.unread(): GET /message/unread', function () {
    context('no user logged in', function () {
      it('should return forbidden', function (done) {
        request(sails.hooks.http.app)
          .get('/message/unread')
          .expect(403)
          .end(done);
      });
    });

    context('user logged in', function () {
      it('should return the number of unread messages', function (done) {
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
            request(sails.hooks.http.app)
              .get('/message/unread')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(200)
              .end(function (error, response) {
                assert.isNull(error);
                assert.strictEqual(response.body.count, 2);
                done();
              });
          });
      });
    });
  });
});
