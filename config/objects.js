var walletConfig = require('./wallet.js');

module.exports.objects = {
  defaultConfig: {
    notifications: {
      '*': { // Notification type
        '*': { // Recipient role
          from: {
            name : 'Notifications',
            email: 'notifications@islive.io'
          }
        }
      }
    },
    wallet : walletConfig.wallet
  }
};
