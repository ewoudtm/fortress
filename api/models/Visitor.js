module.exports = {

  schema: true,

  attributes: {
    user: {
      model: 'user'
    },
    username: {
      type: 'string',
      unique: true
    },

    credits: {
      type: 'integer',
      defaultsTo: 0
    },

    walletId: {
      type: 'integer',
      index: true,
      defaultsTo: null
    }
  }
};
