var VisitorService;

VisitorService = {
  /**
   * @todo test this.
   * @param id
   * @param credits
   * @param req
   * @param callback
   */
  updateCredits: function (id, credits, req, callback) {

    var updateValues = {credits: credits},
        visitor = sails.models.visitor;

    if (typeof req === 'function') {
      callback = req;
      req = false;
    }

    visitor.update(id, updateValues, function (error, updated) {
      if (error) {
        return callback(error);
      }

      if (updated.length > 0) {
        updated.forEach(function (visitorRow) {
          visitor.publishUpdate(visitorRow.id, updateValues, req);
        });
      }

      callback(null, updated);
    });
  },

  register: function (params, callback) {

    sails.services.userservice.wouldBeDuplicate(params, function (error, wouldBe) {
      if (error) {
        return callback(error);
      }

      if (wouldBe) {
        return callback({
          error   : 'user_exists',
          property: wouldBe
        });
      }

      if (params.wallet) {
        var walletCredentials = {
          username: params.username,
          email   : params.email,
          password: params.password,
          object  : params.object.id,
          from_url: params.wallet,
          p       : params.p ? params.p : params.object.partnerCode,
          pi      : params.pi ? params.pi : params.object.partnerInfo
        };

        return sails.services.walletservice.register(walletCredentials, function (error, userRecord) {
          if (error) {
            return callback(error);
          }

          if (!userRecord) {
            return callback({error: 'user_exists', property: 'email'});
          }

          callback(null, userRecord);
        });
      }

      // @todo Implement register for non-wallet users here.
    });
  }
};

module.exports = VisitorService;
