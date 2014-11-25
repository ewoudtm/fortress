var assert = require('chai').assert;

describe('VisitorService', function () {
  describe('.updateCredits()', function () {
  });
  describe('.getVisitor()', function () {
    context('visitor object', function() {
      it('Should call back with the same object.', function (done) {
        var visitorservice = sails.services.visitorservice,
            visitorObject = {username: 'someone'};

        visitorservice.getVisitor(visitorObject, function(err, visitor) {
          assert.isNull(err);
          assert.strictEqual(visitor, visitorObject);
          done();
        });
      });
    });

    context('id of existing visitor', function() {
      it('Should call back with the visitor.', function (done) {
        var visitorservice = sails.services.visitorservice;
        visitorservice.getVisitor(888, function(err, visitor) {
          assert.isNull(err);
          assert.strictEqual(visitor.username, 'fixturetest');
          done();
        });
      });
    });

    context('id of non existent visitor', function() {
      it('Should call back with undefined.', function (done) {
        var visitorservice = sails.services.visitorservice;
        visitorservice.getVisitor(556, function(err, visitor) {
          assert.isUndefined(err);
          assert.isUndefined(visitor);
          done();
        });
      });
    });
  });
});
