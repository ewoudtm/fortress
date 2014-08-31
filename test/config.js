module.exports.scaling = {
  scaled: false
};

module.exports.import = {
  enabled: false
};

module.exports.userSync = {
  enabled: false
};

module.exports.models = {
  connection: 'test',

  migrate: 'safe'
};

module.exports.log = {
  level: 'error'
};


module.exports.connections = {

  test: {
    adapter: 'sails-disk'
  },

  chatterbox: {
    adapter : 'sails-mysql',
    host    : 'localhost',
    user    : 'root',
    password: '',
    database: 'test_fortress'
  },

  mongoLocal: {
    adapter: 'sails-disk' // If referenced in model somewhere, fall back.
  }
};

