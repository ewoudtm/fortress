module.exports = {
  schema: true,
  attributes: {
    messages: {
      collection: 'message',
      via: 'thread'
    },
    subject: 'string',
    from: {
      model: 'user',
      index: true
    },
    to: {
      model: 'user',
      index: true
    },
    toJSON: function() {
      var modelInstance = this.toObject();

      modelInstance._modelName = 'thread';

      return modelInstance;
    }
  },
  afterCreate : function (values, done) {
    sails.services.messageservice.publishInbox(values, done);
  }
};
