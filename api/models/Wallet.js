var mysql = require('mysql');

module.exports = {
  adapter: 'chatterbox',
  migrate: 'safe',

  findUser: function (username, callback) {
    var query = 'select uc.id, uc.available_credits as credits, nickname from userbase.user u join islive3_chat.user_client uc on u.id = uc.id where u.username=' + mysql.escape(username);

    this.query(query, function findUserQuery(error, data) {
      if (error) {
        return callback(error);
      }

      if (typeof data[0] === 'object') {
        return callback(null, data[0]);
      }

      callback(null, null);
    });
  },

  subtractCredits : function(walletId, amount, callback) {
    amount = parseInt(amount);
    walletId = parseInt(walletId);

    var whereSuffix = ' where uc.id = ' + parseInt(walletId)
      , creditCheckQuery = 'select uc.available_credits from islive3_chat.user_client uc' + whereSuffix
      , updateQuery = 'update islive3_chat.user_client uc set uc.available_credits = uc.available_credits - ' + parseInt(amount) + whereSuffix
      , self = this;

    if (amount < 1) {
      return callback('invalid_amount');
    }

    self.query(creditCheckQuery, function(error, data) {
      if (error) {
        return callback(error);
      }

      if (data.length === 0) {
        return callback('invalid_id');
      }

      if (data[0].available_credits < amount) {
        return callback('insufficient_funds');
      }

      self.query(updateQuery, function(error, response) {
        if (error) {
          return callback(error);
        }

        return callback(null, response);
      });
    });
  },

  getSyncQueue: function (callback) {
    var queueQuery = 'select * from islive3_chat.io_sync'
      , cleanupQuery = 'delete from islive3_chat.io_sync where user_id in ('
      , userIds = []
      , self = this;

    this.query(queueQuery, function fetchQueueQuery(error, data) {
      if (error) {
        return callback(error);
      }

      userIds = _.pluck(data, 'user_id');

      cleanupQuery += userIds.join(',')+')';

      if (data.length === 0) {
        return callback(null, [], function() {});
      }

      callback(null, data, function() {
        self.query(cleanupQuery, function(error, a, b) {
          if (error) {
            console.error('Oops!', error, a, b);
          }
        });
      });
    });
  }
};
