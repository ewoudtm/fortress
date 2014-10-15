var assert  = require('chai').assert,
    express = require('express');

function getTestParticipants (callback) {
  async.parallel({
    visitor  : function (callback) {
      sails.models.user.findOne(997).populateAll().exec(callback);
    },
    performer: function (callback) {
      sails.models.user.findOne(996).populateAll().exec(callback);
    }
  }, function (error, results) {

    assert.notOk(error, 'Fetching performer or visitor failed');

    callback(results);
  });
}

describe('NotificationService', function () {
  var mockPayloadOptions = {
    from         : {
      username: 'Marco',
      email   : 'some-test@email.com',
    },
    to           : {
      performer: {},
      username : 'Polo',
      email    : 'some-awesome-test@email.com',
      object   : {
        id: 'not-a-real-id'
      }
    },
    recipientRole: 'performer',
    type         : 'newMessage',
    message      : {
      will   : 'be this',
      initial: true,
      thread : {
        subject: 'lorem'
      }
    }
  };

  // Test .send method
  describe('.send()', function () {
    it('Should fail when no handler was supplied', function (done) {
      var notificationService = sails.services.notificationservice;

      notificationService.send(mockPayloadOptions, function (error) {
        assert.isObject(error);
        assert.property(error, 'error');

        done();
      });
    });

    it('Should call the supplied endpoint for events', function (done) {
      getTestParticipants(function (results) {
        var notificationService = sails.services.notificationservice,
            app = express(),
            payloadOptions = {
              to     : results.visitor,
              from   : results.performer,
              type   : 'newMessage',
              message: {
                initial: false,
                thread : {
                  subject: 'Test message'
                }
              }
            },
            server;

        app.get('/', function (req, res) {
          try {
            assert.deepEqual(req.query, {
              event: 'notification',
              data : {
                type         : 'newMessage',
                from         : {username: 'badpak'},
                to           : {email: 'event.handler@islive.io', username: 'baconbabe'},
                newThread    : 'false',
                subject      : 'Test message',
                recipientRole: 'visitor'
              }
            }, 'Did not receive expected payload');
          } catch (error) {
            return res.status(503).send({error: error});
          }

          res.status(200).send({});
        });

        server = app.listen(6663); //the port you want to use

        notificationService.send(payloadOptions, function (error, response) {
          assert.notOk(error, 'Sending out payload failed');

          if (response.error) {
            throw response.error;
          }

          server.close();
          done();
        });
      });
    });
  });

  describe('.complementOptions', function () {
    it('Should complement the supplied options', function (done) {
      getTestParticipants(function (results) {
        var payloadOptions = {
          to     : results.visitor,
          from   : results.performer,
          type   : 'newMessage',
          message: {
            initial: true,
            thread : {
              subject: 'Test message'
            }
          }
        };

        payloadOptions = sails.services.notificationservice.complementOptions(payloadOptions);

        assert.equal(payloadOptions.endpoint, 'http://localhost:6663', 'Complemented options do not contain expected endpoint');
        assert.equal(payloadOptions.recipientRole, 'visitor', 'Complemented options do not contain expected visitor');

        done();
      });
    });
  });

  // Test .createPayload()
  describe('.createPayload()', function () {
    it('Should create an object which is a valid payload for a notification handler', function (done) {
      var notificationService = sails.services.notificationservice,
          payload = notificationService.createPayload(mockPayloadOptions);

      assert.deepEqual(payload, {
        event: 'notification',
        data : {
          type         : 'newMessage',
          from         : {
            username: 'Marco'
          },
          to           : {
            username: 'Polo',
            email   : 'some-awesome-test@email.com'
          },
          subject      : 'lorem',
          newThread    : true,
          recipientRole: 'performer'
        }
      }, 'Did not get the expected payload.');

      done();
    });

    it('Should function properly with complemented options', function (done) {
      getTestParticipants(function (results) {
        var notificationService = sails.services.notificationservice,
            payloadOptions = {
              to     : results.visitor,
              from   : results.performer,
              type   : 'newMessage',
              message: {
                initial: true,
                thread : {
                  subject: 'Test message'
                }
              }
            };

        assert.deepEqual(notificationService.createPayload(notificationService.complementOptions(payloadOptions)), {
          event: 'notification',
          data : {
            type         : 'newMessage',
            from         : {username: 'badpak'},
            to           : {email: 'event.handler@islive.io', username: 'baconbabe'},
            newThread    : true,
            subject      : 'Test message',
            recipientRole: 'visitor'
          }
        }, 'Complemented options do not equal expected options');

        done();
      });
    });
  });
});
