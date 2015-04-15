module.exports = {
  schema    : true,
  attributes: {
    user: {
      model: 'visitor',
      required: true
    },
    username: {
      type    : 'string',
      regex   : /^[\w\-]{2,14}$/,
      index   : true,
      required: true
    },
    mail : {
      type      : 'boolean',
      defaultsTo: true
    },
    toJSON: function () {
      var modelInstance = this.toObject();

      delete modelInstance.user;

      modelInstance._modelName = 'follow';

      return modelInstance;
    }
  }
};
