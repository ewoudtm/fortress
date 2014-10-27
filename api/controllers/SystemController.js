var requestHelpers = require('request-helpers');

module.exports = {
  totalConnections: function (req, res) {
    res.ok({sessions: Object.keys(sails.io.sockets.sockets).length});
  },
  verify          : function (req, res) {
    requestHelpers.pickParams(['user', 'type'], req, function (error, params) {
      if (error) {
        return res.negotiate(error);
      }

      var newValue = {};

      newValue[(params.type === 'email' ? 'email' : 'notificationEmail') + 'Verified'] = true;

      sails.models.user.update(params.user, newValue, function (error) {
        if (error) {
          return res.negotiate(error);
        }

        res.ok();
      });
    });
  }
};
