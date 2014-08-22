var VisitorService;

VisitorService = {
  /**
   * @todo test this.
   * @param id
   * @param credits
   * @param req
   * @param callback
   */
  updateCredits : function(id, credits, req, callback) {

    var updateValues = {credits: credits}
      , visitor = sails.models.visitor;

    if (typeof req === 'function') {
      callback = req;
      req = false;
    }

    visitor.update(id, updateValues, function(error, updated) {
      if (error) {
        return callback(error);
      }

      if (updated.length > 0) {
        updated.forEach(function(visitorRow) {
          visitor.publishUpdate(visitorRow.id, updateValues, req);
        });
      }

      callback(null, updated);
    });
  }
};

module.exports = VisitorService;
