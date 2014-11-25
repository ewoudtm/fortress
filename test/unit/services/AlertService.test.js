var assert  = require('chai').assert;

describe('AlertService', function () {
  describe('.init()', function () {
    it('Should call back after initialization.', function (done) {
      var alertService = sails.services.alertservice;
      alertService.init(done);
    });
  });

  describe('.push()', function() {
    context('with default parameters', function() {
      it('Should send a notification.', function (done) {
        var alertService = sails.services.alertservice;
        alertService.init(function() {
          alertService.push('some title', 'some message', null, null,
          function(err, notification) {
            assert.isNull(err);
            assert.deepEqual(notification, {
              title: 'some title',
              message: 'some message',
              priority: 0,
              sound: 'persistent'
            });
            done();
          });
        });
      });
    });

    context('with all parameters specified', function() {
      it('Should send a notification.', function (done) {
        var alertService = sails.services.alertservice;
        alertService.init(function() {
          alertService.push(
          'some title',
          'some message',
          8,
          'test',
          function(err, notification) {
            assert.isNull(err);
            assert.deepEqual(notification, {
              title: 'some title',
              message: 'some message',
              priority: 8,
              sound: 'test'
            });
            done();
          });
        });
      });
    });
  });

  describe('.pushEmergency()', function() {
    it('Should send an emergency notification.', function(done) {
      var alertService = sails.services.alertservice;
      alertService.init(function() {
        alertService.pushEmergency('some message', function(err, notification) {
          assert.isNull(err);
          assert.deepEqual(notification, {
            title: 'Emergency',
            message: 'some message',
            priority: 1,
            sound: 'persistent'
          });
          done();
        });
      });
    });
  });

  describe('.pushError()', function() {
    it('Should send an error notification.', function(done) {
      var alertService = sails.services.alertservice;
      alertService.init(function() {
        alertService.pushError('some message', function(err, notification) {
          assert.isNull(err);
          assert.deepEqual(notification, {
            title: 'Error',
            message: 'some message',
            priority: 1,
            sound: 'persistent'
          });
          done();
        });
      });
    });
  });

  describe('.pushNotification()', function() {
    it('Should send an normal notification.', function(done) {
      var alertService = sails.services.alertservice;
      alertService.init(function() {
        alertService.pushNotification('some message', function(err, notification) {
          assert.isNull(err);
          assert.deepEqual(notification, {
            title: 'Notification',
            message: 'some message',
            priority: 0,
            sound: 'persistent'
          });
          done();
        });
      });
    });
  });
});
