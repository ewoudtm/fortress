var assert = require('chai').assert,
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
  var mockOptions = {
    data: {
      from: {
        id      : 135,
        username: 'Marco',
        email   : 'some-test@email.com',
        visitor : {}
      }
    },
    user: {
      id       : 246,
      performer: {},
      username : 'Polo',
      email    : 'some-awesome-test@email.com',
      object   : {
        id: 'not-a-real-id'
      }
    },
    type: 'new_message'
  };

  // Test .send method (also tests .delegate())
  describe('.send()', function () {
    it('Should fail when no handler was supplied', function (done) {
      var notificationService = sails.services.notificationservice;

      notificationService.send(mockOptions.type, mockOptions.user, mockOptions.data, function (error) {
        assert.isObject(error);
        assert.property(error, 'error');

        done();
      });
    });

    it('Should fail on mailable: false for recipient', function (done) {

      var notificationService = sails.services.notificationservice;

      notificationService.send('does_not_matter', {mailable: false}, {}, function (error) {
        assert.deepEqual(error, {
          error      : 'not_mailable',
          description: "User indicated not to want to receive anymore mail from us."
        }, 'Error for mailable: false not thrown.');
      });

      done();
    });

    it('Should call the supplied endpoint for events', function (done) {
      getTestParticipants(function (results) {
        var notificationService = sails.services.notificationservice,
            app = express(),
            options = {
              user: results.visitor,
              type: 'new_message',
              data: {
                from   : notificationService.composeUserObject(results.performer),
                initial: false,
                subject: 'Test message'
              }
            },
            server;

        app.get('/', function (req, res) {
          try {
            assert.deepEqual(req.query, {
              event: 'notification',
              type : 'new_message',
              user : {
                email          : 'event.handler@islive.io',
                id             : '997',
                unsubscribeHash: 'd57f802938aa32a0a43db3664d7bef8e',
                username       : 'baconbabe',
                walletId       : '81',
                role           : 'visitor'
              },
              data : {
                from   : {
                  username       : 'badpak',
                  email          : 'event.handler.performer@islive.io',
                  id             : '996',
                  unsubscribeHash: 'ae5bb2762bce3c31edd5794cb4575400',
                  role           : 'performer'
                },
                initial: 'false',
                subject: 'Test message'
              }
            }, 'Did not receive expected payload');
          } catch (error) {
            return res.status(503).send({error: error});
          }

          res.status(200).send({});
        });

        server = app.listen(6663); //the port you want to use

        notificationService.send(options.type, options.user, options.data, function (error, response) {
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

  // Test .composeUserObject
  describe('.composeUserObject()', function () {
    it('Should correctly build the userObject into a format suitable for transfer', function (done) {
      assert.deepEqual(
        sails.services.notificationservice.composeUserObject(mockOptions.user),
        {
          role           : 'performer',
          username       : 'Polo',
          email          : 'some-awesome-test@email.com',
          id             : 246,
          unsubscribeHash: 'e604a44729cf8fd47dc9262d6ba393b7'
        },
        'Built user object does not equal expected object.'
      );

      done();
    });

    it('Should correctly build the userObject into a format suitable for transfer with notificationEmail', function (done) {

      var differentUser = _.cloneDeep(mockOptions.user);

      assert.deepEqual(
        sails.services.notificationservice.composeUserObject(mockOptions.user),
        {
          role           : 'performer',
          username       : 'Polo',
          email          : 'some-awesome-test@email.com',
          id             : 246,
          unsubscribeHash: 'e604a44729cf8fd47dc9262d6ba393b7'
        },
        'Built user object does not equal expected object.'
      );

      done();
    });

    it('Should not include the walletId for performers (if set)', function (done) {

      var mockUser = _.cloneDeep(mockOptions.user);

      mockUser.performer.walletId = 123;

      var composed = sails.services.notificationservice.composeUserObject(mockUser);

      assert.equal(composed.walletId, undefined, 'Wallet ID not set');

      done();
    });

    it('Should include the walletId for visitors (if set)', function (done) {

      var mockUser = _.cloneDeep(mockOptions.user);

      delete mockUser.performer;
      mockUser.visitor = {walletId: 123};

      var composed = sails.services.notificationservice.composeUserObject(mockUser);

      assert.equal(composed.walletId, 123, 'Wallet ID not set');

      done();
    });
  });

  // Test .createPayload()
  describe('.createPayload()', function () {
    it('Should create an object which is a valid payload for a notification handler', function (done) {
      var notificationService = sails.services.notificationservice,
          payload = notificationService.createPayload(mockOptions.type, mockOptions.user, mockOptions.data);

      assert.deepEqual(payload, {
        event: 'notification',
        type : 'new_message',
        user : notificationService.composeUserObject(mockOptions.user),
        data : mockOptions.data
      }, 'Did not get the expected payload.');

      done();
    });
  });
});
