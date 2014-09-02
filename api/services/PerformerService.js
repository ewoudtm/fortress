module.exports = {
  /**
   * Convenience method. Verifies the given `performer` is a performer object.
   *
   * @param performer
   * @param callback
   * @returns {*}
   */
  getPerformer : function (performer, callback) {
    if (typeof performer === 'object') {
      return callback(null, performer);
    }

    sails.models.performer.findOne(performer, callback);
  }
};
