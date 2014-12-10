/**
 * Before running any API tests, load (but don't lift!) our app.
 * Loading does the same thing as lifting, except it doesn't bind to a port.
 *
 * NOTICE:
 * This exposes the `sails` global.
 *
 * @framework mocha
 */

var SailsApp = require('sails').Sails,
    fs       = require('fs'),
    config   = require('./config.js'),
    mysql    = require('mysql'),
    sails;

function prepareDatabase (done) {

  var credentials = config.connections.chatterbox,
      connection = mysql.createConnection({
        multipleStatements: true,
        host              : credentials.host,
        user              : credentials.user,
        password          : credentials.password
      }),
      initQueries = [
        'drop database if exists ' + credentials.database,
        'create database ' + credentials.database
      ];

  function importData (done) {
    fs.readFile(__dirname + '/data.sql', 'utf8', function (error, source) {
      if (error) {
        return done(done);
      }

      connection.query(source, function (error) {
        if (error) {
          return done(done);
        }

        done(null);

        connection.end();
      });
    });
  }

  // Travis creates db. Local does not.
  if (!process.env.TRAVIS && credentials.host === 'localhost') {
    return connection.query(initQueries.join(';'), function (error) {
      if (error) {
        return done(error);
      }

      importData(done);
    });
  }

  importData(done);
}

before(function (done) {
  process.env.NODE_ENV = 'test';

  prepareDatabase(function (error) {
    if (error) {
      return done(error);
    }

    sails = new SailsApp();
    sails.lift(config, function (error, sails) {
      if (error) {
        return done(error);
      }

      var Barrels = require('barrels');
      var barrels = new Barrels();
      barrels.populate(function (error) {
        if (error) {
        console.log('asdgasdfasdf', error);
          return done(error);
        }


        done();
      });
    });
  });

  // do sync bootstrappy stuff here.
});

after(function (done) {
  sails.lower(done)
});
