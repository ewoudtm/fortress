var request = require('supertest'),
    assert  = require('chai').assert;

describe('VisitorController', function() {
  describe('.setUsername(): PUT /visitor/username', function () {
    context('no logged in user', function () {
      it('Should return forbidden.', function (done) {
        request(sails.hooks.http.app)
          .put('/visitor/username')
          .expect(403)
          .end(done);
      });
    });

    context('logged in user is not visitor', function () {
      it('Should return forbidden.', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            role    : 'performer',
            username: 'event.handler.performer@islive.io',
            password: 'keeshond'
          }).expect(200)
          .end(function (error, response) {
            assert.isNull(error, 'can not log in');

            requestHook
              .put('/visitor/username')
              .set('cookie', response.headers['set-cookie'])
              .expect(403)
              .end(done);
          });
      });
    });

    context('logged in user is a visitor', function () {
      context('username is not specified', function () {
        it('should return bad request', function (done) {
          var requestHook = request(sails.hooks.http.app);

          requestHook
            .post('/user/login')
            .send({
              role    : 'visitor',
              username: 'fixture-test+changeusername@islive.io',
              password: 'keeshond'
            }).expect(200)
            .end(function (error, response) {
              assert.isNull(error, 'can not log in');

              requestHook
                .put('/visitor/username')
                .set('cookie', response.headers['set-cookie'])
                .expect(400)
                .end(done);
            });
        });
      });

      context('same username is specified', function () {
        it('should return bad request', function (done) {
          var requestHook = request(sails.hooks.http.app);

          requestHook
            .post('/user/login')
            .send({
              role    : 'visitor',
              username: 'fixture-test+changeusername@islive.io',
              password: 'keeshond'
            }).expect(200)
            .end(function (error, response) {
              assert.isNull(error, 'can not log in');

              requestHook
                .put('/visitor/username')
                .send({username: 'changeusername'})
                .set('cookie', response.headers['set-cookie'])
                .expect(400)
                .end(done);
            });
        });
      });

      context('existing username is specified within the same object', function () {
        it('should return bad request', function (done) {
          var requestHook = request(sails.hooks.http.app);

          requestHook
            .post('/user/login')
            .send({
              role    : 'visitor',
              username: 'fixture-test+changeusername@islive.io',
              password: 'keeshond'
            }).expect(200)
            .end(function (error, response) {
              assert.isNull(error, 'can not log in');

              requestHook
                .put('/visitor/username')
                .send({username: 'murdercow'})
                .set('cookie', response.headers['set-cookie'])
                .expect(400)
                .end(done);
            });
        });
      });

      context('existing username is specified from another object', function () {
        it('should change the username for the user and the visitor', function (done) {
          var requestHook = request(sails.hooks.http.app);

          requestHook
            .post('/user/login')
            .send({
              role    : 'visitor',
              username: 'fixture-test+changeusername@islive.io',
              password: 'keeshond'
            })
            .expect(200)
            .end(function (error, response) {
              assert.isNull(error, 'can not log in');

              requestHook
                .put('/visitor/username')
                .send({username: 'badpak'})
                .set('cookie', response.headers['set-cookie'])
                .expect(200)
                .end(function (error) {
                  assert.isNull(error, 'can not change the username');
                  sails.models.user.findOne(993, function (error, user) {
                    assert.isNull(error);
                    assert.strictEqual(user.username, 'badpak', 'username was not changed for the user');
                    sails.models.visitor.findOne(884, function (error, user) {
                      assert.isNull(error);
                      assert.strictEqual(user.username, 'badpak', 'username was not changed for the visitor');
                      done();
                    });
                  });
                });
            });
        });
      });

    context('new username is specified', function () {
      it('should change the username for the user and the visitor', function (done) {
        var requestHook = request(sails.hooks.http.app);

        requestHook
          .post('/user/login')
          .send({
            role    : 'visitor',
            username: 'fixture-test+changeusername@islive.io',
            password: 'keeshond'
          })
          .expect(200)
          .end(function (error, response) {
            assert.isNull(error, 'can not log in');

            requestHook
              .put('/visitor/username')
              .send({username: 'brandnew'})
              .set('cookie', response.headers['set-cookie'])
              .expect(200)
              .end(function (error) {
                assert.isNull(error, 'can not change the username');
                sails.models.user.findOne(993, function (error, user) {
                  assert.isNull(error);
                  assert.strictEqual(user.username, 'brandnew', 'username was not changed for the user');
                  sails.models.visitor.findOne(884, function (error, user) {
                    assert.isNull(error);
                    assert.strictEqual(user.username, 'brandnew', 'username was not changed for the visitor');
                    done();
                  });
                });
              });
          });
        });
      });
    });
  });
});