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

        var row = queue.pop();

        sails.models.visitor.update({walletId: row.user_id}, {credits: row.credits}).exec(function() {
          next();
        });
      })();
    });
  }
};
