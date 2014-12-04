var request = require('supertest'),
    assert  = require('chai').assert;

describe('MessageController', function () {
  describe('.create(): POST /message', function () {
    context('visitor logged in', function () {
      context('sending message to an archived thread', function () {
        it('should return ok, create a message and unarchive thread', function (done) {
          var requestHook = request(sails.hooks.http.app),
              Thread = sails.models.thread;

          requestHook
            .post('/user/login')
            .send({
              username: 'fixture-test+message5@islive.io',
              password: 'keeshond',
              role    : 'visitor'
            })
            .expect(200)
            .end(function (error, loginResponse) {
              assert.isNull(error);
              assert.strictEqual(loginResponse.body.id, 985);
              requestHook
                .post('/message')
                .send({
                  title : 'New message',
                  body  : 'New message body',
                  to    : 984,
                  thread: 14
                })
                .set('cookie', loginResponse.headers['set-cookie'])
                .expect(200)
                .end(function (error, response) {
                  assert.isNull(error);

                  Thread.findOne({id: 14}, function (error, thread) {
                    assert.isNull(error);
                    assert.strictEqual(thread.toArchived, false);
                    assert.strictEqual(thread.fromArchived, false);

                    done();
                  });
                });
            });
        });
      });
    });
  });
});
