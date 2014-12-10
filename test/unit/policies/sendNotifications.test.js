var assert  = require('chai').assert,
    request = require('supertest'),
    express = require('express');

describe('sendNotifications()', function () {
  it('Should return a "not_implemented" error when trying to end without handler for object..', function (done) {
    var app = express(),
        called = false,
        requestHook,
        server;

    app.get('/', function (req, res) {
      called = true;

      res.status(200).send({});
    });

    server = app.listen(6663); //the port you want to use
    requestHook = request(sails.hooks.http.app);

    requestHook
      .post('/user/login')
      .send({
        role    : 'visitor',
        username: 'fixture-test@islive.io',
        password: 'keeshond'
      }).end(function (err, res) {
        requestHook
          .put('/user/999')
          .set('cookie', res.headers['set-cookie'])
          .send({notificationEmail: 'something.few@and.blue'})
          .end(function (error, response) {
            assert.strictEqual(response.status, 500, 'Request was successful, but should not have been.');

            assert.deepEqual(response.body, {
              error      : 'not_implemented',
              description: 'This feature hasn\'t been implemented yet.',
              status     : 500
            }, 'Did not get the expected error response.');

            server.close();

            done();
          });
      });
  });

  it('Should successfully update the user his notificationEmail, and call the handler for it.', function (done) {
    var app = express(),
        requestHook,
        server;

    app.get('/', function (req, res) {
      sails.models.user.findOne(995, function (error, userInstance) {

        if (error) {
          return res.status(503).send({error: error});
        }

        var userService = sails.services.userservice,
            actualVerificationHash = userService.generateHash(userInstance, 'verify.notificationEmail'),
            actualUnsubscribeHash = userService.generateHash(userInstance),
            expected;

        expected = {
          event: 'notification',
          type : 'notification_email_changed',
          user : {
            role           : 'visitor',
            id             : '995',
            unsubscribeHash: actualUnsubscribeHash,
            email          : 'something.few@and.blue',
            username       : 'somethingcruel'
          },
          data : {
            verificationHash: actualVerificationHash
          }
        };

        assert.deepEqual(req.query, expected, 'Did not get expected payload.');

        res.status(200).send({});
      });
    });

    server = app.listen(6663); //the port you want to use

    requestHook = request(sails.hooks.http.app);

    requestHook
      .post('/user/login')
      .send({
        role    : 'visitor',
        username: 'send.notificationds@islive.io',
        password: 'keeshond'
      }).end(function (err, res) {
        requestHook
          .put('/user/995')
          .set('cookie', res.headers['set-cookie'])
          .send({notificationEmail: 'something.few@and.blue'})
          .end(function (error, response) {
            assert.strictEqual(response.status, 200, 'Request was invalid');

            server.close();

            done();
          });
      });
  });

  it('Should successfully update the user his email, and call the handler for it.', function (done) {
    var app = express(),
        requestHook,
        server;

    app.get('/', function (req, res) {
      sails.models.user.findOne(995, function (error, userInstance) {

        if (error) {
          return res.status(503).send({error: error});
        }

        var userService = sails.services.userservice,
            actualVerificationHash,
            actualUnsubscribeHash,
            expected;

        userInstance.email = 'something.else@and.welsh';
        actualVerificationHash = userService.generateHash(userInstance, 'verify.email');
        actualUnsubscribeHash = userService.generateHash(userInstance);

        expected = {
          event: 'notification',
          type : 'email_changed',
          user : {
            role           : 'visitor',
            id             : '995',
            unsubscribeHash: actualUnsubscribeHash,
            email          : 'something.else@and.welsh',
            username       : 'somethingcruel'
          },
          data : {
            verificationHash: actualVerificationHash
          }
        };

        assert.deepEqual(req.query, expected, 'Did not get expected payload.');

        res.status(200).send({});
      });
    });

    server = app.listen(6663); //the port you want to use

    requestHook = request(sails.hooks.http.app);

    requestHook
      .post('/user/login')
      .send({
        role    : 'visitor',
        username: 'send.notificationds@islive.io',
        password: 'keeshond'
      }).end(function (err, res) {
        requestHook
          .put('/user/995')
          .set('cookie', res.headers['set-cookie'])
          .send({email: 'something.else@and.welsh'})
          .end(function (error, response) {
            assert.strictEqual(response.status, 200, 'Request was invalid');

            server.close();

            done();
          });
      });
  });

  it('Should do nothing if neither email or notificationEmail were changed.', function (done) {
    var app = express(),
        called = false,
        requestHook,
        server;

    app.get('/', function (req, res) {
      called = true;

      res.status(200).send({});
    });

    server = app.listen(6663); //the port you want to use
    requestHook = request(sails.hooks.http.app);

    requestHook
      .post('/user/login')
      .send({
        role    : 'visitor',
        username: 'send.notificationds@islive.io',
        password: 'keeshond'
      }).end(function (err, res) {
        requestHook
          .put('/user/995')
          .set('cookie', res.headers['set-cookie'])
          .send({mailable: true})
          .end(function (error, response) {
            assert.isFalse(called, 'Server was called, but should not have been.');

            server.close();

            done();
          });
      });
  });
});
