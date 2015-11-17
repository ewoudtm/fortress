var md5 = require('MD5');

function getSecondsElapsed (date) {
  if (!date) {
    return 0;
  }

  return Math.round((date.getTime() - (new Date()).getTime()) / 1000);
}

var TrackThisService = {

  track: function (req, callback) {

    callback = callback || function () {
      // Just here to avoid errors.
    };

    var trackingInfo = req.trackthis,
        producer = trackingInfo.producer,
        product = trackingInfo.product,
        consumer = trackingInfo.consumer,
        endUser = 'islive|' + consumer.id,
        t = new Date(),
        unique = [
          'islive.io',
          producer.id,
          consumer.id,
          t.getTime()
        ].join('|'),
        trackingData;

    if (trackingInfo.extraUnique) {
      unique += '|' + trackingInfo.extraUnique;
    }

    trackingData = {
      domain       : req.object.host,
      promotor_id  : req.partnerInfo.partnerCode,
      promotor_info: req.partnerInfo.partnerInfo,
      sub_type     : product.currency === 'credits' ? 'wallet' : ppm,
      paytype_id   : product.paytype,
      user         : (producer.username) ? producer.username.toLowerCase() : producer.username,
      sessionid    : md5('i.io' + consumer.id + t.getTime()),
      unique       : unique,
      country      : consumer.country || 'NL', // @todo fetch from userService. Maintain ip and country.
      amount       : 1, // @todo secondsElapsed for existing payment (type "access")
      minutes      : 0, // @todo secondsElapsed for existing payment (type "access")
      ip           : req.ip,
      status       : 'success', // @todo conditional for '' status with access type payments
      remote_id    : consumer.id,
      end_user     : endUser
    };

    sails.models.trackthispayment.create(trackingData, function (error, registered) {
      if (error) {
        return callback(error);
      }

      callback(null, registered);
    });

  },

  /**
   * Finish the given payment
   *
   * @param {{}} payment
   * @param {Function} payment
   *
   * @returns {TrackThisPayment}
   */
  finish: function (payment, callback) {
    payment.status = 'success';

    payment.save(callback);
  }
};

module.exports = TrackThisService;
