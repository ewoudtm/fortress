/*jshint loopfunc: true */
function ImportService() {

  var performerModel = sails.models.performer,
      importModel = sails.models.import,
      userModel = sails.models.user,
      objectModel = sails.models.object,
      socket = sails.services.chatservice.getSocket(),
      alertService = sails.services.alertservice,
      dateFormat = require('dateformat'),
      config = sails.config,
      util = require('util'),
      mysql = require('mysql'),
      defaultObject,
      lastUpdateString,
      connection,
      baseQuery,
      countQuery,
      importQuery,
      fields;

  /**
   * The fields to fetch
   * @type {Array}
   */
  fields = [
    'm.modelnaam',
    'm.email_adres',
    'm.geboren',
    's.last_login',
    'm.passwd',
    'm.sterrenbeeld',
    'm.beschrijving',
    'm.nationaliteit',
    'm.piercing',
    'm.muziek',
    'm.taal0',
    'm.taal1',
    'm.taal2',
    'm.ogen',
    'm.haar',
    'm.geaardheid',
    'm.hobbies',
    'm.huisdieren',
    'm.eten',
    'm.drinken',
    'm.man_type',
    'm.webcammen',
    'm.standje',
    'm.plekje',
    'm.turnoff',
    'm.kaal_baal',
    'm.mooiste_deel',
    'm.beste_man_delen',
    'm.doel_leven',
    'm.motto',
    'm.figuur',
    'm.relatie',
    'm.roken',
    'm.cupmaat',
    'm.geslacht',
    's.country',
    's.woonplaats',
    's.waardering',
    'mm.status media_status',
    'mm.activated media_active',
    'uiterlijk.value uiterlijk'
  ];

  /**
   * The un-formatted baseQuery
   *
   * @type {string}
   * @todo join model_callmenow islive.model_callmenow
   */
  baseQuery = 'select %s' +
  ' from modellen m join model_status s on m.modelnaam = s.modelnaam' +
  ' left outer join model_multimedia mm on mm.model = m.modelnaam' +
    //' left outer join model_callmenow mc on mc.modelnaam = m.modelnaam' +
  ' left outer join props_model uiterlijk on uiterlijk.model = m.modelnaam and uiterlijk.property = "uiterlijk"' +
  '  where m.disabled = 0 and m.last_modified > ?';

  /**
   * The un-formatted countQuery
   *
   * @type {string}
   */
  countQuery = util.format(baseQuery, 'count(*) as totalRows');

  /**
   * The un-formatted importQuery
   *
   * @type {string}
   */
  importQuery = util.format(baseQuery, fields.join(','));

  /**
   * Normalize an islive row into one that our model likes.
   *
   * @param {{}} row
   * @returns {{}}
   */
  function getRowValues(row) {
    var values = {
      username        : row.modelnaam,
      dateOfBirth     : row.geboren,
      lastLogin       : row.last_login,
      zodiac          : row.sterrenbeeld,
      description     : row.beschrijving,
      languages       : [],
      eyeColor        : row.ogen,
      hairColor       : row.haar,
      sexualPreference: row.geaardheid,
      piercings       : row.piercing,
      music           : row.muziek,
      appearance      : row.figuur,
      relationship    : row.relatie,
      nationality     : row.nationaliteit,
      smoking         : row.roken,
      cupSize         : row.cupmaat,
      gender          : row.geslacht,
      hobbies         : row.hobbies,
      pets            : row.huisdieren,
      food            : row.eten,
      drinks          : row.drinken,
      manType         : row.man_type,
      webcamming      : row.webcammen,
      sexPosition     : row.standje,
      sexLocation     : row.plekje,
      turnoff         : row.turnoff,
      shaved          : row.kaal_baal,
      nicestAboutMe   : row.mooiste_deel,
      nicestAboutMen  : row.beste_man_delen,
      lifeGoal        : row.doel_leven,
      motto           : row.motto,
      country         : row.country,
      city            : row.woonplaats,
      rating          : '' === row.waardering ? -1 : row.waardering,
      ethnicity       : row.uiterlijk
    };

    if (row.media_status === 'goedgekeurd' && row.media_active === 1) {
      values.promoClip = 'http://' + row.modelnaam + '.islive.nl/multimedia/promotie/' + row.modelnaam + '_promotie.flv';
      values.promoClipMobile = 'http://images.islive.nl/' + row.modelnaam + '/multimedia/promotie/' + row.modelnaam + '_mobile.m4v';
    }

    if (null !== row.taal0 && '' !== row.taal0) {
      values.languages.push(row.taal0);
    }

    if (null !== row.taal1 && '' !== row.taal1) {
      values.languages.push(row.taal1);
    }

    if (null !== row.taal2 && '' !== row.taal2) {
      values.languages.push(row.taal2);
    }

    return values;
  }

  /**
   * Handle errors in a generic way for this service.
   *
   * @param {*} error
   * @param {string} message
   */
  function handleError(error, message) {
    if (!error) {
      return;
    }

    alertService.pushEmergency(message);

    sails.log.error(message);
    sails.log.error(error);

    if (error.invalidAttributes) {
      return sails.log.error(error.invalidAttributes);
    }

    try {
      connection.end();
    } catch (ignore) {
      // Just here to prevent the application from crashing if end cannot be called.
    }

    process.exit(1);
  }

  /**
   * Simple log method
   *
   * @param {string} message
   * @param {string} [method]
   */
  function log(message, method) {
    method = method || 'debug';
    message = dateFormat(new Date(), 'mmm dd "at" HH:MM:ss') + ': ' + message;

    return sails.log[method](message);
  }

  /**
   * Simple progress util (only works in dev)
   *
   * @param {Number} processed
   * @param {Number} total
   */
  function progress(processed, total) {

    if (config.environment === 'production') {
      return;
    }

    var percentage = Math.floor((processed / total) * 100),
        message = '... ' + dateFormat(new Date(), 'mmm dd "at" HH:MM:ss') + ': ';

    if (Number.isNaN(percentage)) {
      percentage = '100%';
    } else {
      percentage += '%';
    }

    message += processed + ' / ' + total + ' (' + percentage + ')';

    if (typeof process.stdout.clearLine === 'function') {
      process.stdout.clearLine();
    }

    process.stdout.write(message + "\r");
  }

  /**
   * Import / update a performer model row.
   *
   * @param {{}} row
   * @param {{}} rowValues
   */
  function importPerformerModel(row, rowValues) {
    performerModel.update({username: row.modelnaam}, rowValues).exec(function performerUpdateDone(error, model) {
      handleError(error, 'Importing performer (update performer) failed.');

      var newUser = {
        email    : row.email_adres.replace(/(^\s+)|(\s+$)/g, ''),
        password : row.passwd
      };

      // Higher than 0 means we just updated the record.
      if (model.length > 0) {
        return userModel.update(model[0].user, newUser).exec(function (error) {
          handleError(error, 'Importing performer (update user) failed.');

          connection.resume();
        });
      }

      newUser.username  = row.modelnaam;
      newUser.roles     = ['performer'];
      newUser.object    = defaultObject.id;
      newUser.performer = rowValues;

      // Not higher than 0, we'll have to create a new record.
      return userModel.register(newUser, function onRegisterModel(error) {
        connection.resume();

        handleError(error, 'Importing performer ' + newUser.username + ' (create) failed.');
      }, true);
    });
  }

  /**
   * Update the online status for the performer.
   *
   * @param {string} name
   * @param {boolean} status
   * @param {Function} callback
   */
  function setPerformerStatus(name, status, callback) {
    performerModel.update({username: name}, {online: !!status}).exec(function performerStatusUpdated(error, model) {

      handleError(error, 'Updating performer status failed.');

      if (typeof callback === 'function') {
        callback(model[0]);
      }
    });
  }

  /**
   * Setup the listeners for performer status changes.
   */
  function runOnlineListener() {
    log('Attaching listeners for performer status...');

    // When a performer comes online
    socket.on('performer join', function (data) {
      setPerformerStatus(data.user, true, function (model, duplicate) {
        if (duplicate) {
          return log('Performer already online: ' + data.user);
        }

        return log('Performer set online: ' + data.user);
      });
    });

    // When a performer goes offline.
    socket.on('performer part', function (data) {
      setPerformerStatus(data.user, false, function () {
        log('Performer set offline: ' + data.user);
      });
    });

    // Init performers
    socket.emit('online performers', {}, function (performers) {

      log("Setting performers online...");
      var onlinePerformers = Object.keys(performers).length, performersDone = 0;

      function incrementProgress() {
        progress(++performersDone, onlinePerformers);
      }

      Object.getOwnPropertyNames(performers).forEach(function (name) {
        setPerformerStatus(name, true, incrementProgress);
      });
    });
  }

  /**
   * Import performers that have changed since lastUpdateString
   *
   * @param {Function} [callback]
   */
  function runImport(callback) {

    connection = mysql.createConnection(config.import.credentials);

    log('Starting import...');
    connection.connect(function establishConnection(error) {

      handleError(error, 'Failed connecting to database.');

      connection.query(mysql.format(countQuery, [lastUpdateString]), function (error, row) {

        handleError(error, 'Failed fetching row count.');

        var totalRows = row[0].totalRows,
            query = connection.query(mysql.format(importQuery, [lastUpdateString])),
            processedRows = 0;

        /**
         * On error event, throw a new, readable error.
         */
        query.on('error', function (error) {
          handleError(error, 'Importing performers failed.');
        });

        /**
         * For every result, either update or create a new row.
         */
        query.on('result', function processRow(row) {

          processedRows++;

          // Skip if account was kicked, or has stopped.
          if (null !== row.passwd.match(/^(kick_|kicked_|stop_|gestopt_|kicked|gestopt)/)) {
            return progress(processedRows, totalRows);
          }

          // Skip if date of birth is invalid.
          if (Object.prototype.toString.call(row.geboren) !== "[object Date]" || isNaN(row.geboren.getTime())) {
            return progress(processedRows, totalRows);
          }

          // We'll be doing some pretty radical stuff. Pause connection.
          connection.pause();

          return importPerformerModel(row, getRowValues(row));
        });

        /**
         * When we're done importing, report back to console and close connection.
         */
        query.on('end', function () {

          var lastUpdate = new Date();

          importModel.update({}, {lastUpdate: lastUpdate}).exec(function (error, model) {

            lastUpdateString = dateFormat(model.lastUpdate, 'yyyy-mm-dd HH:MM:ss');

            log("Updated last import-update date. Done importing, closing connection.");

            if (typeof callback === 'function') {
              callback();
            }

            connection.end();
          });
        });
      });
    });
  }

  /* Public methods */

  /**
   * Initialize the importService
   */
  this.init = function (callback) {
    async.parallel({
      importModel  : function (callback) {
        importModel.findOrCreate({}, {}, callback);
      },
      defaultObject: function (callback) {
        objectModel.findOne({host: config.system.defaultObject.host}, callback);
      }
    }, function (error, results) {
      handleError(error, 'Error during installation.');

      var model = results.importModel,
          object = results.defaultObject;
      
      lastUpdateString = dateFormat(model.lastUpdate, 'yyyy-mm-dd HH:MM:ss');
      defaultObject = object;

      callback();

      performerModel.update({}, {online: false}).exec(function (error) {
        handleError(error, 'Setting performers offline failed.');
        runImport(function () {
          runOnlineListener();
          setInterval(runImport, 600000);
        });
      });
    });
  };
}

module.exports = ImportService;
