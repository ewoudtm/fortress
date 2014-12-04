var request = require('supertest'),
    assert  = require('chai').assert;

describe('ThreadController', function () {
  describe('.find(): GET /thread', function () {
    context('no user logged in', function () {
      it('should return forbidden', function (done) {
        request(sails.hooks.http.app)
          .put('/thread')
          .expect(403)
          .end(done);
      });

      context('user logged in', function () {
        it('should return the non-archived threads for the user', function (done) {
          var requestHook = request(sails.hooks.http.app);

          requestHook
            .post('/user/login')
            .send({
              username: 'fixture-test+message3@islive.io',
              password: 'keeshond',
              role    : 'visitor'
            })
            .expect(200)
            .end(function (error, loginResponse) {
              assert.isNull(error);
              assert.strictEqual(loginResponse.body.id, 987);
              requestHook
                .get('/thread')
                .set('cookie', loginResponse.headers['set-cookie'])
                .expect(200)
                .end(function (error, response) {
                  var threads = response.body;

                  assert.isNull(error);
                  assert.lengthOf(threads, 4);
                  assert.strictEqual(threads[0].id, 8);
                  assert.strictEqual(threads[1].id, 9);
                  assert.strictEqual(threads[2].id, 11);
                  assert.strictEqual(threads[3].id, 13);
                  done();
                });
            });
        });
      });
    });
  });

  describe('.getThreadCount(): GET /thread/thread-count', function () {
    context('user logged in', function () {
      it('should return the non-archived threads for the user', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test+message3@islive.io',
            password: 'keeshond',
            role    : 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 987);
            requestHook
              .get('/thread/thread-count')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(200)
              .end(function (error, response) {
                assert.isNull(error);
                assert.strictEqual(response.body.count, 4);
                done();
              });
          });
      });
    });
  });

  describe('.update(): PUT /thread/:id', function () {
    context('no user logged in', function () {
      it('should return forbidden', function (done) {
        request(sails.hooks.http.app)
          .put('/thread/6')
          .expect(403)
          .end(done);
      });
    });

    context('non-owner user logged in', function () {
      it('should return forbidden', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'event.handler.performer@islive.io',
            password: 'keeshond',
            role    : 'performer'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 996);
            requestHook
              .put('/thread/6')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(403)
              .end(function (error, response) {
                assert.isNull(error);
                assert.strictEqual(response.body.error, 'You are not permitted to perform this action.');
                done();
              });
          });
      });
    });

    context('thread does not exist', function () {
      it('should return not found', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test+message1@islive.io',
            password: 'keeshond',
            role    : 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 989);
            requestHook
              .put('/thread/999')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(404)
              .end(done);
          });
      });
    });

    context('archived: true', function () {
      context('recipient logged in', function () {
        it('should return ok and set toArchived to true for the thread', function (done) {
          var requestHook = request(sails.hooks.http.app);

          requestHook
            .post('/user/login')
            .send({
              username: 'fixture-test+message1@islive.io',
              password: 'keeshond',
              role    : 'visitor'
            })
            .expect(200)
            .end(function (error, loginResponse) {
              assert.isNull(error);
              assert.strictEqual(loginResponse.body.id, 989);
              requestHook
                .put('/thread/6')
                .send({archived: true})
                .set('cookie', loginResponse.headers['set-cookie'])
                .expect(200)
                .end(function (error, response) {
                  assert.isNull(error);
                  assert.strictEqual(response.body.id, 6);
                  sails.models.thread.findOne({id: 6}, function (error, thread) {
                    assert.isNull(error);
                    assert.isFalse(thread.fromArchived);
                    assert.isTrue(thread.toArchived);
                    done()
                  });
                });
            });
        });
      });

      context('sender logged in', function () {
        it('should return ok and set fromArchived to true for the thread', function (done) {
          var requestHook = request(sails.hooks.http.app);

          requestHook
            .post('/user/login')
            .send({
              username: 'fixture-test+message1@islive.io',
              password: 'keeshond',
              role    : 'visitor'
            })
            .expect(200)
            .end(function (error, loginResponse) {
              assert.isNull(error);
              assert.strictEqual(loginResponse.body.id, 989);
              requestHook
                .put('/thread/7')
                .send({archived: true})
                .set('cookie', loginResponse.headers['set-cookie'])
                .expect(200)
                .end(function (error, response) {
                  assert.isNull(error);
                  assert.strictEqual(response.body.id, 7);
                  sails.models.thread.findOne({id: 7}, function (error, thread) {
                    assert.isNull(error);
                    assert.isTrue(thread.fromArchived);
                    assert.isFalse(thread.toArchived);
                    done()
                  });
                });
            });
        });
      });
    });
  });
});
