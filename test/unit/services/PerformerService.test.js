var assert  = require('chai').assert;

describe('PerformerService', function () {
  describe('.getPerformer()', function () {
    context('performer object', function() {
      it('Should call back with the same object.', function (done) {
        var performerservice = sails.services.performerservice,
            performerObject = {username: 'someone'};
        performerservice.getPerformer(performerObject, function(err, performer) {
          assert.isNull(err);
          assert.strictEqual(performer, performerObject);
          done();
        });
      });
    });

    context('id of existing performer', function() {
      it('Should call back with the country code of the IP.', function (done) {
        var performerservice = sails.services.performerservice;
        performerservice.getPerformer(555, function(err, performer) {
          assert.isNull(err);
          console.log(performer);
          assert.strictEqual(performer.username, 'badpak');
          done();
        });
      });
    });

    context('id of non existent performer', function() {
      it('Should call back with null.', function (done) {
        var performerservice = sails.services.performerservice;
        performerservice.getPerformer(556, function(err, performer) {
          assert.isUndefined(err);
          assert.isUndefined(performer);
          done();
        });
      });
    });
  });
});