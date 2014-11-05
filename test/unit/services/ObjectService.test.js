var assert = require('chai').assert;

describe('ObjectService', function () {

  describe('.resolve()', function () {

    it('Should resolve a hostname to an un-cached object.', function (done) {
      var objectService = sails.services.objectservice;

      objectService.resolve('objectservice.by.id.islive.io', function (error, objectInstance) {
        assert.notOk(error, 'Resolved returned an error.');
        assert.isObject(objectInstance, 'objectInstance is not an object.');
        assert.equal(objectInstance.partnerInfo, "objservdiff", objectInstance.partnerInfo + ' does not equal objservdiff.');

        done();
      });
    });

    it('Should resolve an id to an un-cached object.', function (done) {
      var objectService = sails.services.objectservice;

      objectService.resolve(4, function (error, objectInstance) {
        assert.notOk(error, 'Resolved returned an error.');
        assert.isObject(objectInstance, 'objectInstance is not an object.');
        assert.equal(objectInstance.partnerCode, '1234', objectInstance.partnerCode + ' does not equal 1234.');

        done();
      });
    });

    it('Should resolve a hostname to a cached object.', function (done) {
      var objectService = sails.services.objectservice;

      objectService.resolve('objectservice.by.id.islive.io', function (error, objectInstance) {
        objectInstance.cacheTest = true;

        objectService.resolve('objectservice.by.id.islive.io', function (error, newObjectInstance) {
          assert.notOk(error, 'Resolve returned an error.');
          assert.isObject(newObjectInstance, 'objectInstance is not an object.');
          assert.isTrue(newObjectInstance.cacheTest, 'objectService did not cache object.');

          delete newObjectInstance.cacheTest;

          done();
        });
      });
    });

    it('Should resolve an id to a cached object.', function (done) {
      var objectService = sails.services.objectservice;

      objectService.resolve(4, function (error, objectInstance) {
        objectInstance.cacheTest = true;

        objectService.resolve(4, function (error, newObjectInstance) {
          assert.notOk(error, 'Resolve returned an error.');
          assert.isObject(newObjectInstance, 'objectInstance is not an object.');
          assert.isTrue(newObjectInstance.cacheTest, 'objectService did not cache object.');

          delete newObjectInstance.cacheTest;

          done();
        });
      });
    });

    it('Should resolve a hostname to an object that was cached by an id.', function (done) {
      var objectService = sails.services.objectservice;

      objectService.resolve(4, function (error, objectInstance) {
        objectInstance.cacheTest = true;

        objectService.resolve('objectservice.by.hostname.islive.io', function (error, newObjectInstance) {
          assert.notOk(error, 'Resolving to cached object returned error.');
          assert.isTrue(newObjectInstance.cacheTest, 'newObjectInstance does not come from cache.');

          delete objectInstance.cacheTest;

          done();
        });
      });
    });

    it('Should resolve an id to an object that was cached by hostname.', function (done) {
      var objectService = sails.services.objectservice;

      objectService.resolve('objectservice.by.id.islive.io', function (error, objectInstance) {
        objectInstance.cacheTest = true;

        objectService.resolve(5, function (error, newObjectInstance) {
          assert.notOk(error, 'Resolving to cached object returned error.');
          assert.isTrue(newObjectInstance.cacheTest, 'newObjectInstance does not come from cache.');

          delete objectInstance.cacheTest;

          done();
        });
      });
    });

    it('Should return an error if a hostname cannot be resolved to an object', function (done) {
      var objectService = sails.services.objectservice;

      objectService.resolve('does.not.exist.io', function (error, objectInstance) {
        assert.deepEqual(error, {error: 'unknown_object'}, 'Unknown object did not cause an error to be returned.');
        assert.isUndefined(objectInstance, 'Got unexpected objectInstance.');

        done();
      });
    });

    it('Should return an error if an id cannot be resolved to an object', function (done) {
      var objectService = sails.services.objectservice;

      objectService.resolve(90047583, function (error, objectInstance) {
        assert.deepEqual(error, {error: 'unknown_object'}, 'Unknown object did not cause an error to be returned.');
        assert.isUndefined(objectInstance, 'Got unexpected objectInstance.');

        done();
      });
    });
  });
});
