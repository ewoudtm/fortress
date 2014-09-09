var request = require('request'),
    service = 'http://target.geoaddicted.net/';

module.exports = {
  getCountry: function (ip, callback) {
    var parameters = {
      action    : 'track',
      output    : 'json_encode',
      co        : 1,
      ip2loc_add: 'country_code',
      ip        : ip
    };

    request.get(service, {qs: parameters}, function (error, response, body) {
      var responseData;

      if (error) {
        return callback(error);
      }

      try {
        responseData = JSON.parse(body);
      } catch (error) {
        return callback(error);
      }

      callback(null, responseData.country_code);
    });
  }
};
