var requestHelpers = require('request-helpers'),
    validator      = require('mandrill-webhook-validator');

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

          if (field === 'email') {
            sails.services.messageservice.sendWelcomeMessage(visitor.user);
          }

          verify(visitor.user, field);
        });
      }

      // All failed, error.
      res.negotiate('missing_parameter', 'user or wallet-user');
    });
  },
  debug           : function (req, res) {
    sails.config.system.debug = req.param('toggle') === 'on';

    res.ok();
  },
  unsubscribe     : function (req, res) {
    var events = JSON.parse(req.param('mandrill_events'));

    function verifyKey (req) {
      return req.headers['x-mandrill-signature'] === validator.makeSignature(sails.config.mandrill.key, sails.config.mandrill.url, req.body);
    }

    if(!events || events.length < 1) {
      return res.negotiate('invalid_request');
    }

    if (!verifyKey(req)) {
      return res.negotiate('invalid_signature');
    }

    for (var i in events) {
      sails.models.user.update({email: events[i].msg.email}, {mailable: 0}, function (error, result) {
        if (error) {
          return res.negotiate(error);
        }
      });
    }

    res.ok();
  },

  unsubscribeWallet: function (req, res) {
    var id = req.param('id');

    sails.models.user.findOne(id, function (error, user) {
      if (error) {
        return res.serverError('database_error', error);
      }

      if (!user) {
        return res.badRequest('unknown_user');
      }

      user.mailable = false;

      user.save(function (error) {
        if (error) {
          return res.serverError('database_error', error);
        }

        res.ok();
      });
    });
  },

  getUser: function (req, res) {
    var username = req.param('username');

    if (!username) {
      return res.badRequest('missing_parameter', 'username');
    }

    sails.models.user.findOne({username: username}).exec(function (error, result) {
      if (error) {
        return res.serverError('database_error', error);
      }

      res.ok(result);
    });
  }
};
