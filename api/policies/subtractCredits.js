module.exports = function(req, res, next) {
  var config = sails.config.prices
    , options = req.options
    , userInfo = req.session.userInfo
    , priceKey = options.model + '.' + options.action
    , product;

  // First, check if user is visitor.
  if (userInfo.roles.indexOf('visitor') === -1) {

    // If not performer, bad request. Only visitor and performer are allowed.
    if (userInfo.roles.indexOf('performer') === -1) {
      return res.badRequest('missing_role', 'visitor or performer');
    }

    // All good. Performer doesn't have credits so it's free.
    return next();
  }

  // Check if called action exists in pricing list.
  if (typeof config[priceKey] === 'undefined') {
    return res.badRequest('invalid_product', 'Product with key "'+priceKey+'" was not found.');
  }

  product = config[priceKey];

  // Update credits in the wallet (single source of truth yada yada).
  if (userInfo.walletId) {
    return sails.models.wallet.subtractCredits(userInfo.walletId, product.amount, function(error, result) {
      // Error or credits reduced.
      if (error) {
        if (typeof error === 'string') {
          return res.badRequest(error);
        }

        return res.serverError(error);
      }

      next();
    });
  }

  // Update credits in islive.io
  sails.models.user.findOne(req.session.user).populate('visitor').exec(function(error, user) {
    if (error) {
      return res.serverError('database_error', error);
    }

    if (user.visitor.credits < product.amount) {
      return res.badRequest('insufficient_funds', 'Need at least '+product.amount+' credits.');
    }

    user.visitor.credits -= product.amount;

    user.visitor.save(function(error) {
      if (error) {
        return res.serverError('database_error', error);
      }

      next();
    });
  });
};
