module.exports = {
  schema    : true,
  attributes: {
    user: {
      type  : 'integer',
      index : true,
    },
    username: {
      type  : 'string',
      regex : /^[\w\-]{2,14}$/,
      index : true,
    },
    toJSON: function () {
      var modelInstance = this.toObject();

      delete modelInstance.id;
      delete modelInstance.user;

      modelInstance._modelName = 'follow';

      return modelInstance;
    }
  }
};
