var request = require('request');

/**
 * The strategies and implementations in this file will probably change.
 * For now, all prerequisites are in place.
 *
 * @type {{send: Function, delegate: Function}}
 */

module.exports = {
  send: function (options, callback) {

    options = this.complementOptions(options);

    if (options.endpoint) {
      return this.delegate(options, callback);
    }

    callback({
      error      : 'not_implemented',
      description: "This feature hasn't been implemented yet."
    });
  },

  delegate: function (options, callback) {
    var parameters = {qs: this.createPayload(options)};

    request.get(options.endpoint, parameters, function (error, response, body) {
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

  complementOptions : function (options) {
    options.recipientRole = options.to.visitor ? 'visitor' : 'performer';
    options.objectConfig  = sails.services.objectconfigservice.initConfig(options.to.object)
    options.endpoint      = options.objectConfig.resolve([
      'notifications',
      options.type,
      options.recipientRole,
      'handler'
    ].join('.'));

    return options;
  },

  createPayload: function (options) {
    return {
      event: 'notification',
      data : {
        type         : options.type,
        from         : {
          username: options.from.username
        },
        to           : {
          email   : options.to.email,
          username: options.to.username
        },
        newThread    : options.message.initial,
        subject      : options.message.thread.subject,
        recipientRole: options.recipientRole
      }
    };
  }
};
