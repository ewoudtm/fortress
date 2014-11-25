var request = require('supertest'),
    assert  = require('chai').assert,
    io = require('socket.io-client'),
    net = require('net');

describe('SystemController', function () {
  describe('.totalConnections(): GET /system/total-connections', function () {
    it('should return 0 if there is no connection', function (done) {

      request(sails.hooks.http.app)
        .get('/system/total-connections')
        .expect('Content-Type', /json/)
        .expect(function (res) {
          assert.strictEqual(res.body.sessions, 0);
        })
        .expect(200, done);
    });
  });

  describe('.verify(): GET /system/verify/:type', function () {
    beforeEach(function (done) {
      sails.models.user.update(998, {
        emailVerified: false,
        notificationEmailVerified: false
      }, done);
    });

    context('regular user', function() {
      context('email', function () {
        it('should set an attribute verified', function (done) {
          request(sails.hooks.http.app)
            .get('/system/verify/email?user=998')
            .expect('Content-Type', /json/)
            .expect(function (req) {
              assert.strictEqual(req.body.status, 200);
            })
            .expect(200, function (err) {
              if (err) return done(err);
              sails.models.user.findOne({id: 998}, function (err, user) {
                if (err) return done(err);
                assert.strictEqual(user.emailVerified, true);
                done();
              });
            });
        });
      });

      context('notificationEmail', function () {
        it('should set an attribute verified', function (done) {
          request(sails.hooks.http.app)
            .get('/system/verify/notificationEmail?user=998')
            .expect('Content-Type', /json/)
            .expect(function (req) {
              assert.strictEqual(req.body.status, 200);
            })
            .expect(200, function (err) {
              if (err) return done(err);
              sails.models.user.findOne({id: 998}, function (err, user) {
                if (err) return done(err);
                assert.strictEqual(user.notificationEmailVerified, true);
                done();
              });
            });
        });
      });
    });

    context('wallet user', function () {
      context('email', function () {
        it('should set an attribute verified', function (done) {
          request(sails.hooks.http.app)
            .get('/system/verify/email?walletUser=13')
            .expect('Content-Type', /json/)
            .expect(function (req) {
              assert.strictEqual(req.body.status, 200);
            })
            .expect(200, function (err) {
              if (err) return done(err);
              sails.models.user.findOne({id: 998}, function (err, user) {
                if (err) return done(err);
                assert.strictEqual(user.emailVerified, true);
                done();
              });
            });
        });
      });

      context('notificationEmail', function () {
        it('should set an attribute verified', function (done) {
          request(sails.hooks.http.app)
            .get('/system/verify/notificationEmail?walletUser=13')
            .expect('Content-Type', /json/)
            .expect(function (req) {
              assert.strictEqual(req.body.status, 200);
            })
            .expect(200, function (err) {
              if (err) return done(err);
              sails.models.user.findOne({id: 998}, function (err, user) {
                if (err) return done(err);
                assert.strictEqual(user.notificationEmailVerified, true);
                done();
              });
            });
        });
      });
    });
  });

  describe('.debug(): GET /system/debug/:toggle', function () {
    context('toggle is on', function () {
      it('Should turn debug mode on', function (done) {
        sails.config.system.debug = false;
        request(sails.hooks.http.app)
          .get('/system/debug/on')
          .expect('Content-Type', /json/)
          .expect(function (req) {
            assert.strictEqual(req.body.status, 200);
          })
          .expect(200, function (err) {
            if (err) return done(err);
            assert.isTrue(sails.config.system.debug);
            done();
          });
      });
    });

    context('toggle is off', function () {
      it('Should turn debug mode off', function (done) {
        sails.config.system.debug = true;
        request(sails.hooks.http.app)
          .get('/system/debug/off')
          .expect('Content-Type', /json/)
          .expect(function (req) {
            assert.strictEqual(req.body.status, 200);
          })
          .expect(200, function (err) {
            if (err) return done(err);
            assert.isFalse(sails.config.system.debug);
            done();
          });
      });
    });

    context('toggle is something else', function () {
      it('Should turn debug mode off', function (done) {
        sails.config.system.debug = true;
        request(sails.hooks.http.app)
          .get('/system/debug/something')
          .expect('Content-Type', /json/)
          .expect(function (req) {
            assert.strictEqual(req.body.status, 200);
          })
          .expect(200, function (err) {
            if (err) return done(err);
            assert.isFalse(sails.config.system.debug);
            done();
          });
      });
    });
  });
});
