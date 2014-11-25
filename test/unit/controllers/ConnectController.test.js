var request = require('supertest'),
    assert  = require('chai').assert;

describe('ConnectController', function () {
  describe('.getCookie(): GET /connect/getcookie', function () {
    it('should return javascript code calling the callback function with true', function (done) {

      request(sails.hooks.http.app)
        .get('/connect/getcookie?callback=cb')
        .expect('Content-Type', /javascript/)
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Set-Cookie', /sails\.sid/)
        .expect(function (res) {
          assert.equal(res.text, 'cb(true);');
        })
        .expect(200, done);
    })
  });

  describe('.safariGetCookie(): GET /connect/safari-getcookie', function () {
    it('should return javascript calling the callback function with true', function (done) {

      request(sails.hooks.http.app)
        .get('/connect/safari-getcookie')
        .set('Referrer', 'http://islive.io/some-page')
        .expect('Location', 'http://islive.io/some-page')
        .expect(302, done);
    })
  });
});
