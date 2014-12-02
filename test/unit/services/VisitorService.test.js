var assert = require('chai').assert,
    io     = require('socket.io-client');

describe('VisitorService', function () {
  describe('.updateCredits()', function () {
    context('without req parameter', function () {
      it('Should update the credits of the visitor.', function (done) {
        var visitorservice = sails.services.visitorservice;

        visitorservice.updateCredits(888, 25, function (error, updated) {
          assert.isNull(error);
          assert.strictEqual(updated.length, 1);
          assert.strictEqual(updated[0].credits, 25);
          done();
        });
      });
    });
    context('with req parameter', function () {
      it('Should update the credits of the visitor.', function (done) {
        var visitorservice = sails.services.visitorservice;

        visitorservice.updateCredits(888, 26, {}, function (error, updated) {
          assert.isNull(error);
          assert.strictEqual(updated.length, 1);
          assert.strictEqual(updated[0].credits, 26);
          done();
        });
      });
    });
    context('updating via socket.io', function () {
      var socket,
          credentials = {
            role    : 'visitor',
            username: 'fixture-test@islive.io',
            password: 'keeshond',
          };

      before(function (done) {
        socket = io.connect('http://127.0.0.1:' + sails.config.port + '/');
        socket.once('connect', done);
      });

      after(function () {
        socket.disconnect();
      });

      it('Should send an update to the clients.', function (done) {
        var visitorservice = sails.services.visitorservice;

        socket.emit('post', JSON.stringify({url: '/user/login', data: credentials}), function () {
          socket.emit('get', JSON.stringify({url: '/user/identity/visitor'}), function () {
            socket.on('visitor', function (updateData) {
              assert.strictEqual(updateData.data.credits, 26);
              done();
            });
            visitorservice.updateCredits(888, 26, {}, function () {
            });
          });
        });
      });
    })
  });

  describe('.getVisitor()', function () {
    context('visitor object', function () {
      it('Should call back with the same object.', function (done) {
        var visitorservice = sails.services.visitorservice,
            visitorObject = {username: 'someone'};

        visitorservice.getVisitor(visitorObject, function (err, visitor) {
          assert.isNull(err);
          assert.strictEqual(visitor, visitorObject);
          done();
        });
      });
    });

    context('id of existing visitor', function () {
      it('Should call back with the visitor.', function (done) {
        var visitorservice = sails.services.visitorservice;
        visitorservice.getVisitor(888, function (err, visitor) {
          assert.isNull(err);
          assert.strictEqual(visitor.username, 'fixturetest');
          done();
        });
      });
    });

    context('id of non existent visitor', function () {
      it('Should call back with undefined.', function (done) {
        var visitorservice = sails.services.visitorservice;
        visitorservice.getVisitor(556, function (err, visitor) {
          assert.isUndefined(err);
          assert.isUndefined(visitor);
          done();
        });
      });
    });
  });
});
