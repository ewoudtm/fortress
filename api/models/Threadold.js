module.exports = {
  schema     : true,
  connection : 'mongoLocal',
  migrate    : 'safe',
  tableName  : 'thread',
  attributes : {
    messages: {
      collection: 'messageold',
      via       : 'thread'
    },
    subject : 'string',
    from    : {
      model: 'userold'
    },
    to      : {
      model: 'userold'
    },
    toJSON  : function () {
      var modelInstance = this.toObject();

      modelInstance._modelName = 'thread';

      return modelInstance;
    }
  },
  afterCreate: function (values, done) {
    sails.services.messageservice.publishInbox(values, done);
  }
};
