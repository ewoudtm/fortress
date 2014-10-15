var request = require('supertest'),
    assert  = require('chai').assert;

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

  describe('.verifyEmail(): GET /user/verify?hash=&email=', function () {

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

      var requestHook = request(sails.hooks.http.app)
        , testUserId  = 999
        , newValues   = {
            username   :'Bob',
            UnknownProp:'.|.'
          }
        , credentials = {
            role    : 'visitor',
            username: 'fixture-test@islive.io',
            password: 'keeshond'
          };

        requestHook
          .post('/user/login')
          .send(credentials)
          .end(function(err, res) {
            assert.isFalse(res.error, "User login failed");
            assert.strictEqual(res.status, 200, 'Request was invalid');

            requestHook
              .put('/user/' + testUserId)
              .set('cookie', res.headers['set-cookie'])
              .send(newValues)
              .end(function(err, user) {
                assert.strictEqual(user.status, 200, 'Request was invalid');
                assert.isUndefined(user.body.UnknownProp, 'UnknownProp should not be updated because the property is not set in the model');
                assert.strictEqual(user.body.username, newValues.username, 'Username equals "' + newValues.username + '"');

                done();
              });
          });
    });
  });
});
