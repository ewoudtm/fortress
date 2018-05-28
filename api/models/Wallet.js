var mysql = require('mysql'),
    test  = process.env.NODE_ENV === 'test',
    dbs   = {
      user       : (test ? 'test_fortress' : 'userbase') + '.user',
      user_client: (test ? 'test_fortress' : 'islive3_chat') + '.user_client',
      io_sync    : (test ? 'test_fortress' : 'islive3_chat') + '.io_sync'
    };

module.exports = {
  connection: 'chatterbox',
  migrate   : 'safe',

  destroy: function (id) {
    if (isNaN(id)) { return };

    var destroyUserQuery = 'DELETE FROM ' + dbs.user + 'WHERE `id`= ' + id;
    var destroyUserClientQuery = 'DELETE FROM ' + dbs.user_client + 'WHERE `id`= ' + id;

    this.query(destroyUserQuery);
    this.query(destroyUserClientQuery);

  },

  findUser: function (programId, username, callback) {
    var query = '' +
      'select ' +
      'uc.id, ' +
      'uc.available_credits as credits, ' +
      'u.reg_promotor_info, ' +
      'if (u.verified_dt is null, 0, 1) as email_verified,' +
      'ifnull(u.reg_promotor_id, uc.partner_code) as partner_code ' +
      'from ' + dbs.user + ' u ' +
      'join ' + dbs.user_client + ' uc on u.id = uc.id ' +
      'where u.username=' + mysql.escape(username) + ' and reg_program_id=' + mysql.escape(programId);

    this.query(query, function findUserQuery (error, data) {
      if (error) {
        return callback(error);
      }

      if (typeof data[0] === 'object') {
        return callback(null, data[0]);
      }

      callback(null, null);
    });
  },

  subtractCredits: function (walletId, amount, callback) {
    amount = parseInt(amount);
    walletId = parseInt(walletId);

    if (!walletId) {
      return callback('missing_parameter');
    }

    if (!amount) {
      return callback('invalid_amount');
    }

    var whereSuffix = ' where uc.id = ' + walletId,
        creditCheckQuery = 'select uc.available_credits from ' + dbs.user_client + ' uc' + whereSuffix,
        updateQuery = 'update ' + dbs.user_client + ' uc set uc.available_credits = uc.available_credits - ' + amount + whereSuffix,
        self = this;

    self.query(creditCheckQuery, function (error, data) {
      if (error) {
        return callback(error);
      }

      if (data.length === 0) {
        return callback('invalid_id');
      }

      if (data[0].available_credits < amount) {
        return callback('insufficient_funds');
      }

      self.query(updateQuery, function (error, response) {
        if (error) {
          return callback(error);
        }

        return callback(null, response);
      });
    });
  },

  getSyncQueue: function (callback) {
    var queueQuery = 'select * from ' + dbs.io_sync,
        cleanupQuery = 'delete from ' + dbs.io_sync + ' where user_id in (',
        userIds = [],
        self = this;

    this.query(queueQuery, function fetchQueueQuery (error, data) {
      if (error) {
        return callback(error);
      }

      userIds = _.pluck(data, 'user_id');

      cleanupQuery += userIds.join(',') + ')';

      if (data.length === 0) {
        return callback(null, [], function () {
        });
      }

      callback(null, data, function () {
        self.query(cleanupQuery, function (error, a, b) {
          if (error) {
            console.error('Oops!', error, a, b);
          }
        });
      });
    });
  }
};
