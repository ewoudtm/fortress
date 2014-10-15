/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://links.sailsjs.org/docs/config/bootstrap
 */
'use strict';

module.exports.bootstrap = function (cb) {
  /**
   * Initialize the (performer) importer
   */
  function initializeImporter() {
    // Ensure default object.
    sails.models.object.findOrCreate({host: sails.config.system.defaultObject.host}, sails.config.system.defaultObject, function (error) {
      if (error) {
        return cb(error);
      }

      sails.log.info('Initialized chat service. Initializing import service.');
      try {
        if (typeof sails.config.import.enabled !== 'undefined' && true === sails.config.import.enabled) {
          var importService = new (require('../api/services/ImportService'));
          importService.init(cb);
        } else {
          cb();
        }
      } catch (error) {
        sails.log.info('Running importer failed.');
        console.error(error);
        process.exit();
      }
    });
  }

  var alertService = sails.services.alertservice;

  alertService.init(function () {
    alertService.pushEmergency(
      'The application just started. ' +
      'Perhaps Forever kicked in, and this is a restart. ' +
      'Perhaps it is not. either way, I thought I should let you know.'
    );

    sails.log.info('Starting sync.');
    if (sails.config.userSync.enabled) {
      sails.services.syncservice.run();
    }

    sails.log.info('Initializing chat service.');
    sails.services.chatservice.initialize(initializeImporter);
  });
};
