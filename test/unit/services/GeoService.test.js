var assert = require('chai').assert;

describe('GeoService', function () {
  describe('.getCountry()', function () {
    context('IP with country', function() {
      it('Should call back with the country code of the IP.', function (done) {
        var geoservice = sails.services.geoservice;
        geoservice.getCountry('87.250.149.94', function(err, countryCode) {
          assert.isNull(err);
          assert.strictEqual(countryCode, 'NL');
          done();
        });
      });
    });
    context('IP without country', function() {
      it('Should call back with null.', function (done) {
        var geoservice = sails.services.geoservice;
        geoservice.getCountry('127.0.0.1', function(err, countryCode) {
          assert.isNull(err);
          assert.isNull(countryCode);
          done();
        });
      });
    });
  });
});
