var assert  = require('chai').assert,
    express = require('express');

describe('MessageService', function () {
  describe('.sendNotification()', function () {
    it('Should send the notification to configured handler.', function (done) {
      var messageService = sails.services.messageservice,
          message = {
            thread : {
              subject: 'Check this'
            },
            from   : {
              id           : 2,
              object       : 3,
              email        : 'from@someone.org',
              emailVerified: true,
              mailable     : true
            },
            initial: false
          };

      sails.models.user.findOne(997).populate('object').exec(function (error, user) {
        assert.notOk(error, 'Fetching user failed');

        var app = express(),
            server;

        app.get('/', function (req, res) {
          try {
            assert.deepEqual(req.query, {
              event: 'notification',
              type : 'new_message',
              user : {
                email          : 'event.handler@islive.io',
                id             : '997',
                role           : 'visitor',
                unsubscribeHash: 'd57f802938aa32a0a43db3664d7bef8e',
                username       : 'baconbabe'
              },
              data : {
                from   : {
                  email          : 'from@someone.org',
                  id             : '2',
                  role           : 'performer',
                  unsubscribeHash: '0e4da87a2d3494bdb8be90ffdb9036ad'
                },
                initial: 'false',
                subject: 'Check this'
              }
            }, 'Did not receive expected payload');
          } catch (error) {
            return res.status(503).send({error: error});
          }

          res.status(200).send({});
        });

        server = app.listen(6663);

        message.to = user;

        messageService.sendNotification(message, function (error, response) {
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
});
