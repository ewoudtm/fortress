var requestHelpers     = require('request-helpers'),
    requiredProperties = [
      {required: false, param: 'email'},
      {required: false, param: 'notificationEmail'}
    ];

module.exports = function (req, res, next) {
  requestHelpers.pickParams(requiredProperties, req, function (error, params) {
    if (error) {
      return next({error: 'missing_parameter', message: error});
    }

    if (params.notificationEmail) {
      sendChangedNotification('notification_email', params.notificationEmail);
    }

    if (params.email) {
      sendChangedNotification('email', params.email);
    }

    if (!params.email && !params.notificationEmail) {
      return next();
    }

    function sendChangedNotification (type, newValue) {
      var notificationService = sails.services.notificationservice,
          field = type === 'email' ? 'email' : 'notificationEmail',
          userMock = {
            id      : req.session.user,
            username: req.session.userInfo.username,
            object  : req.session.userInfo.objectId || req.object.id,
            mailable: true,
            email   : req.session.userInfo.email
          };

      if (req.session.userInfo.walletId) {
        userMock.walletId = req.session.userInfo.walletId;
      }

      userMock[field]              = newValue;
      userMock[field + 'Verified'] = true;

      req.session.userInfo.roles.forEach(function (role) {
        userMock[role] = req.session.userInfo[role + 'Id'];
      });

      notificationService.send(type + '_changed', userMock, {
        verificationHash: sails.services.userservice.generateHash(userMock, 'verify.' + field)
      }, next);
    }
  })
};
