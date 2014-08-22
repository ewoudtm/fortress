module.exports = {
  schema: true,
  attributes: {
    messages: {
      collection: 'message',
      via: 'thread'
    },
    subject: 'string',
    from: {
      model: 'user'
    },
    to: {
      model: 'user'
    },
    toJSON: function() {
      var modelInstance = this.toObject();

      modelInstance._modelName = 'thread';

      return modelInstance;
    }
  }
};
