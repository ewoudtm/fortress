var request = require('request');

/**
 * The strategies and implementations in this file will probably change.
 * For now, all prerequisites are in place.
 *
 * @type {{send: Function, delegate: Function}}
 */

module.exports = {
  send: function (type, user, data, done) {

    var self = this;

    done = done || function () {
      // Just here to avoid errors.
    };

    async.waterfall([

      // Make sure we have a user instance.
      function (callback) {
        if (typeof user === 'object') {
          return callback(null, user);
        }

        sails.models.user.findOne(user).populate('visitor').exec(callback);
      },

      // User hasn't un-subscribed from mailings.
      function (userInstance, callback) {
        user = userInstance;

        if (user.mailable) {
          return callback(null);
        }

        callback({
          error      : 'not_mailable',
          description: "User indicated not to want to receive anymore mail from us."
        });
      },

      // User has at least one mailable address
      function (callback) {
        if (user.notificationEmailVerified || user.emailVerified) {
          return callback(null);
        }

        callback({
          error      : 'not_mailable',
          description: "User has not verified email address."
        });
      },

      // Init objectConfig
      function(callback) {
        sails.services.objectconfigservice.initConfig(user.object, callback);
      }
    ], function (error, objectConfig) {
      if (error) {
        return done(error);
      }

      var endpoint = objectConfig.resolve([
            'notifications',
            type,
            user.visitor ? 'visitor' : 'performer',
            'handler'
          ].join('.'));

      if (endpoint) {
        return self.delegate(
          endpoint,
          self.createPayload(type, user, data),
          done
        );
      }

      done({
        error      : 'not_implemented',
        description: "This feature hasn't been implemented yet."
      });
    });
  },

  delegate: function (endpoint, payload, callback) {
    request.get(endpoint, {qs: payload}, function (error, response, body) {
      var responseData;

      if (error) {
        return callback(error);
      }

      try {
        responseData = JSON.parse(body);
      } catch (error) {
        return callback(error);
      }

      callback(null, responseData);
    });
  },

  composeUserObject: function (user) {
    var userObject = {
      role           : user.visitor ? 'visitor' : 'performer',
      username       : user.username,
      id             : user.id,
      unsubscribeHash: sails.services.userservice.generateHash(user)
    };

    if (user.notificationEmail && user.notificationEmailVerified) {
      userObject.email = user.notificationEmail;
    } else {
      userObject.email = user.email;
    }

    if (user.visitor && user.visitor.walletId) {
      userObject.walletId = user.visitor.walletId;
    }

    return userObject;
  },

  createPayload: function (type, user, data) {
    return {
      event: 'notification',
      type : type,
      user : this.composeUserObject(user),
      data : data
    };
  }
};
