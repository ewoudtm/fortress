module.exports.scaling = {
  scaled: false
};

module.exports.system = {
  masterIps    : ['87.213.98.98', '127.0.0.1'],
  defaultObject: {
    host       : 'api.islive.io',
    partnerCode: 61,
    partnerInfo: 'typein',
    email      : 'test@ratus.nl'
  }
};

module.exports.import = {
  enabled: false
};

module.exports.userSync = {
  enabled: false
};

module.exports.models = {
  connection: 'test',

  migrate: 'drop'
};

module.exports.log = {
  level: 'error'
};

module.exports.wallet = {
  walletAPIUrl: 'http://mysecurewallet.nl/payment/islive/ajax/wallet'
};

module.exports.notifications = {
  enabled: false
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

module.exports.connections.trackthis = module.exports.connections.test; // TrackThis foo!
