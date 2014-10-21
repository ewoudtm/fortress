var assert = require('chai').assert;

function initObject (objectId, callback) {
  // First fetch specified object
  sails.models.object.findOne(objectId, function (error, result) {

    // Always assert error
    assert.notOk(error, 'Fetching Object model failed.');

    callback(sails.services.objectconfigservice.initConfig(result));
  });
}

describe('ObjectConfigService', function () {

  /**
   * Updating socketId cases
   */
  describe('.initConfig()', function () {
    // Default config.
    it('Should fall back to default config if none was supplied', function (done) {
      var defaultObjectConfig = sails.config.objects.defaultConfig;

      // Object 1 doesn't have custom configuration.
      initObject(1, function (objectConfig) {

        // Check the default config
        assert.deepEqual(objectConfig.config, defaultObjectConfig, 'The config is different.');

        // Also check non-existing values
        assert.isNull(objectConfig.resolve('something'), 'The config is different.');

        done();
      });
    });
  });

  describe('.resolve()', function () {
    // Dot-separated resolved and wildcards.
    it('Should allow dot-separated resolves; even with Object supplied config options', function (done) {

      // Object 2 has custom configuration.
      initObject(2, function (objectConfig) {

        // Fallback (wildcard)
        assert.equal(objectConfig.resolve('notifications.something.performer.from.name'), 'Notifications', 'The config is different.');

        // Override by Object
        assert.equal(objectConfig.resolve('notifications.something.visitor.from.name'), 'Helpdesk', 'The config is different.');

        done();
      });
    });

    // Test caching mechanism.
    it('Should cache the object\'s config.', function (done) {
      // Object 2 has custom configuration.
      initObject(2, function (objectConfig) {

        var override = 'Override';

        // Fallback (wildcard) check if value initially already is as expected.
        assert.equal(objectConfig.resolve('notifications.something.performer.from.name'), 'Notifications', 'The config is different.');

        // Override wildcard (dirty).
        objectConfig.config.notifications.something = {performer: {from: {name: override}}};

        // Fetch object again...
        initObject(2, function (objectConfig) {

          // ... and check if override took effect.
          assert.equal(objectConfig.resolve('notifications.something.performer.from.name'), override, 'The config is different.');

          // Clean up after ourselves for future tests.
          delete objectConfig.config.notifications.something;

          // Check if cleanup went ok.
          assert.equal(objectConfig.resolve('notifications.something.performer.from.name'), 'Notifications', 'We did not clean up properly.');

          done();
        });
      });
    });
  });

  describe('.merge()', function () {
    it('Should correctly merge extra configuration options', function (done) {
      initObject(2, function (objectConfig) {
        var configBackup = _.cloneDeep(objectConfig.config),
            extra = {
              foo          : 'bar',
              bacon        : {
                really: {
                  is: 'Amazing'
                }
              },
              notifications: {
                something: {
                  visitor: {
                    from: {
                      email: 'my.awesome@test.org'
                    }
                  }
                }
              }
            };

        // Should start with helpdesk@mysecurewallet.nl
        assert.equal(objectConfig.resolve('notifications.something.visitor.from.email'), 'helpdesk@mysecurewallet.nl', 'The config is different.');

        // Now merge in the new values
        objectConfig.merge(extra);

        // Should now find foo...
        assert.equal(objectConfig.resolve('foo'), 'bar', 'The config is different.');

        // ... And new, nested values, too.
        assert.equal(objectConfig.resolve('bacon.really.is'), 'Amazing', 'The config is different.');

        // And have changed email.
        assert.equal(objectConfig.resolve('notifications.something.visitor.from.email'), 'my.awesome@test.org', 'The config is different.');

        // Now let's clean up again...
        objectConfig.config = configBackup;

        // ... And verify that we actually did.
        assert.equal(objectConfig.resolve('notifications.something.visitor.from.email'), 'helpdesk@mysecurewallet.nl', 'The config is different.');
        assert.isNull(objectConfig.resolve('bacon.really.is'), 'Config not cleaned up properly.');

        // We made it!
        done();
      });
    });
  });
});
