var request = require('supertest'),
    assert  = require('chai').assert;

describe('UserController', function () {
  describe('.getUsername(): GET /user/username/:id', function () {
    it('should return the username for our test user.', function (done) {

      var testUserId = 999;

      request(sails.hooks.http.app)
        .get('/user/username/' + testUserId)
        .set('Content-Type', 'application/json')
        .set('X-Object-Host', 'api.islive.io')
        //.expect('Content-Type', /json/)
        .expect(function (res) {
          assert.property(res.body, 'username', 'Username returned');
          assert.strictEqual(res.body.username, 'fixturetest', 'Username equals "fixturetest"');
        })
        .expect(200, done);
    })
  })
});
