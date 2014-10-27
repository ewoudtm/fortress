var requestHelpers = require('request-helpers');

module.exports = {
  totalConnections: function (req, res) {
    res.ok({sessions: Object.keys(sails.io.sockets.sockets).length});
  },
  verify          : function (req, res) {
    var requiredProperties = [
      'type',
      {required: false, param: 'user'},
      {required: false, param: 'walletUser'}
    ];

    function verify (id, field) {
      var newValue = {};

      newValue[field + 'Verified'] = true;

      sails.models.user.update(id, newValue, function (error) {
        if (error) {
          return res.negotiate(error);
        }

        res.ok();
      });
    }

    requestHelpers.pickParams(requiredProperties, req, function (error, params) {
      if (error) {
        return res.negotiate(error);
      }

      var field = params.type === 'email' ? 'email' : 'notificationEmail';

      // Update by Fortress ID (regular users)
      if (params.user) {
        return verify(params.user, field);
      }

      // Update by wallet ID (legacy)
      if (params.walletUser) {
        return sails.models.visitor.findOne({walletId: params.walletUser}, function (error, visitor) {
          if (error) {
            return res.negotiate(error);
          }

          if (!visitor) {
            return res.negotiate('unknown_user');
          }

          verify(visitor.user, field);
        });
      }

      // All failed, error.
      res.negotiate('missing_parameter', 'user or wallet-user');
    });
  }
};
