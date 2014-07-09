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

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  sails.log.info('Starting sync.');
  sails.services['syncservice'].run();
  sails.log.info('Initializing chat service.');
  sails.services.chatservice.initialize(function() {
    sails.log.info('Initialized chat service. Initializing import service.');
    try {
      if (typeof sails.config.import.enabled !== 'undefined' && true === sails.config.import.enabled) {
        var importService = new (require('../api/services/ImportService'));
        importService.init(function() {
          sails.log.info('Initialized import service. Calling next in bootstrap.');
        });
      }
    } catch (error) {
      sails.log.info('Running importer failed.');
      console.error(error);
      process.exit();
    }

    //cb();
  });
  cb();
};
