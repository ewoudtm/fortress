var request = require('supertest'),
    assert  = require('chai').assert;

describe('ThreadController', function () {
  describe('.markRead(): PUT /thread/mark-read', function () {
    context('user not logged in', function () {
      it('should return forbidden', function (done) {
        request(sails.hooks.http.app)
          .put('/thread/mark-read')
          .expect(403)
          .end(done);
      });
    });
    context('no thread parameter', function () {
      it('should return bad request', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond',
            role: 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 999);
            request(sails.hooks.http.app)
              .put('/thread/mark-read')
              .set('cookie', loginResponse.headers['set-cookie'])
              .expect(400)
              .end(done);
          });
      });
    });
    context('thread not belonging to the user', function () {
      it('should return forbidden', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond',
            role: 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 999);
            request(sails.hooks.http.app)
              .put('/thread/mark-read')
              .set('cookie', loginResponse.headers['set-cookie'])
              .send({thread: 1})
              .expect(403)
              .end(done);
          });
      });
    });
    context('thread with read messages sent to the user', function () {
      it('should still return ok', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond',
            role: 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 999);
            request(sails.hooks.http.app)
              .put('/thread/mark-read')
              .set('cookie', loginResponse.headers['set-cookie'])
              .send({thread: 2})
              .expect(200)
              .end(done);
          });
      });
    });
    context('thread sent by the user', function () {
      it('should return forbidden', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond',
            role: 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 999);
            request(sails.hooks.http.app)
              .put('/thread/mark-read')
              .set('cookie', loginResponse.headers['set-cookie'])
              .send({thread: 3})
              .expect(403)
              .end(done);
          });
      });
    });
    context('thread with unread messages sent to the user', function () {
      it('should make the messages in the thread read', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            username: 'fixture-test@islive.io',
            password: 'keeshond',
            role: 'visitor'
          })
          .expect(200)
          .end(function (error, loginResponse) {
            assert.isNull(error);
            assert.strictEqual(loginResponse.body.id, 999);
            request(sails.hooks.http.app)
              .put('/thread/mark-read')
              .set('cookie', loginResponse.headers['set-cookie'])
              .send({thread: 4})
              .expect(200)
              .end(function (error, response) {
                assert.isNull(error);
                sails.models.message.findOne({id: 4}, function (error, thread) {
                  assert.isNull(error);
                  console.log(thread);
                  assert.strictEqual(thread.read, true);
                  done();
                });
              });
          });
      });
    });
  });

  describe('.threadCount(): GET /thread/thread-count', function () {
    context('user not logged in', function () {
      it('should return forbidden');
    });
    context('user logged in', function () {
      it('should return the number of threads from and to the user');
    });
  });
});
