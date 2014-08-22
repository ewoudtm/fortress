module.exports = {
  run : function() {
    var self = this;

    sails.models.wallet.getSyncQueue(function(error, queue, done) {

      if (error) {
        return console.error(error);
      }

      (function next() {
        if (queue.length === 0) {
          done();

          setTimeout(function() {
            self.run();
          }, 750);

          return;
        }

        var row = queue.pop()
          , visitorService = sails.services.visitorservice;


        visitorService.updateCredits({walletId: row.user_id}, row.credits, function(error) {
          if (error) {
            sails.log.error('error while syncing credits.', error);
          }

          next();
        });
      })();
    });
  }
};
