var sails = require('sails');

module.exports = {
  lift : function(config, callback) {
    if (typeof config === 'function') {
      callback = config;
      config = {};
    }

    sails.lift(config, callback);
  },

  liftTest : function(config, callback) {
    if (typeof config === 'function') {
      callback = config;
      config = {};
    }

    // Extend given config with config from test directory.
  }
};
