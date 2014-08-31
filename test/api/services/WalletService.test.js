var sails  = require('sails'),
    config = require('../../config.js'),
    assert = require('assert'),
    app;

/**
 * @todo make this work, as soon as I figure out... how..
 */

before(function (done) {
  console.log('Called');
  sails.lift(config, function (error, instance) {
    if (error) {
      throw error;
    }

    app = instance;

    done();
  });
});

describe('The Wallet service responsible for talking to the Wallet', function () {
  var walletService = app.services.walletservice;

  it('should be able to import a user.', function (done) {
    // sails.services.walletservice.importUser();
    done();
  });

  it('should be able to log in a user over jsonp.', function (done) {
    var credentials = {
      username: 'fortress-test@ratus.nl',
      password: 'keeshond'
    };

    walletService.login(credentials, function (error, user) {
      console.log(error, user);
    });
  });
});

after(function (done) {
  console.log('Low low low');
  sails.lower(function (error) {
    done();
  });
});
