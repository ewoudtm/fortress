var md5 = require('MD5')
  , salt;

var hashService = module.exports = {

  setSalt: function(newSalt) {
    salt = newSalt;
  },

  getSalt: function() {
    if (!salt) {
      salt = sails.config.wallet.salt;
    }

    return salt;
  },

  generateLoginHash: function(email, safe) {
    var hash = this.encode(email);

    if (safe) {
      hash = encodeURIComponent(hash);
    }

    return hash;
  },

  encode: function(email) {
    var buffer = new Buffer(md5(this.getSalt() + email, {asBytes: true}));

    return buffer.toString('base64').replace('==', '');
  },

  verifyLoginHash: function(hash, email) {
    return this.encode(email) === hash;
  }
};
