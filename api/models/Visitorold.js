module.exports = {

  schema    : true,
  connection: 'mongoLocal',
  migrate   : 'safe',
  tableName : 'visitor',

  attributes: {

    user: {
      model: 'userold'
    },

    username: {
      type : 'string',
      regex: /^[\w\-]{2,14}$/
    },

    credits: {
      type      : 'integer',
      defaultsTo: 0
    },

    walletId: {
      type      : 'integer',
      index     : true,
      defaultsTo: null
    },

    toJSON: function () {
      var modelInstance = this.toObject();

      modelInstance._modelName = 'visitor';

      return modelInstance;
    }
  }
};
