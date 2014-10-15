var objectConfigs = {},
    defaultConfig;

function getDefaultConfig() {
  if (!defaultConfig) {
    defaultConfig = sails.config.objects.defaultConfig;
  }

  return defaultConfig;
}

function ObjectConfig (config, defaultConfig) {
  defaultConfig = defaultConfig || {};
  this.config   = _.merge({}, defaultConfig, config);
}

ObjectConfig.prototype = {

  /**
   * Merge a new object into the already existing config.
   *
   * @param {{}} config
   *
   * @returns {Object}
   */
  merge: function (config) {
    return _.merge(this.config, config);
  },

  /**
   * Resolve a key (dot separated for nesting) to a value.
   * This strategy takes care of wildcard resolving as well.
   *
   * @param {string} key
   *
   * @returns {*}
   */
  resolve: function (key) {
    var config = this.config;

    if (config[key]) {
      return config[key];
    }

    if (typeof key !== 'string' && typeof key !== 'number') {
      return null;
    }

    return key.split('.').every(function (segment) {
      if (typeof segment !== 'string' && typeof segment !== 'number') {
        return false;
      }

      if (config[segment]) {

        config = config[segment];

        return true;
      }

      config = config['*'];

      return !!config;
    }) ? config : null;
  }
};

module.exports = {

  /**
   * Initialize (or return cached) Object cache.
   *
   * @param {{}} object
   *
   * @returns {*}
   */
  initConfig: function (object) {
    if (objectConfigs[object.id]) {
      return objectConfigs[object.id];
    }

    var defaultConfig = getDefaultConfig(),
        config        = new ObjectConfig(defaultConfig);

    if (object.config) {
      config.merge(object.config);
    }

    objectConfigs[object.id] = config;

    return config;
  }
};
