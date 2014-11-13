// Init getter for log info
Object.defineProperty(global, '__logInfo', {
  get: function () {

    var original = Error.prepareStackTrace,
        error,
        stack;

    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };

    error = new Error;

    Error.captureStackTrace(error, arguments.callee);

    stack = error.stack;
    Error.prepareStackTrace = original;

    stack = stack[3];

    var fileName = stack.getFileName().replace(process.cwd(), ''),
        lineNumber = stack.getLineNumber(),
        functionName = stack.getFunctionName(),
        logInfo = fileName + ':' + lineNumber;

    if (functionName) {
      logInfo += ' in function "' + functionName + '"';
    }

    return logInfo;
  }
});

function assign (assignment, fallbackValue) {
  var value;

  fallbackValue = fallbackValue || 'none';

  try {
    value = assignment();
  } catch (error) {
    value = fallbackValue;
  }

  if (typeof value === 'undefined') {
    value = fallbackValue;
  }

  return value;
}

module.exports = {
  dateString: function () {
    var m = new Date();

    return m.getFullYear() + "/" + (m.getMonth() + 1) + "/" + m.getDate() + " " + m.getHours() + ":" + m.getMinutes() + ":" + m.getSeconds();
  },

  reqError: function (req) {
    sails.log.error(':: [' + this.dateString() + '] Report start');
    sails.log.error(':: ' + __logInfo);

    var logEntries = Array.prototype.slice.call(arguments, 1);

    if (req.isSocket) {
      var socketReferrer;

      socketReferrer = assign(function () {
        return req.socket.handshake.headers.referer;
      });

      logEntries = logEntries.concat([
        '- Is socket: ', 'Yes',
        '- Socket referrer: ', socketReferrer,
        '- Socket host:', assign(function () {
          return req.socket.host;
        })
      ]);
    }

    logEntries = logEntries.concat([
      '- Url:', req.url,
      '- Referrer:', assign(function () {
        return req.header('referrer');
      }),
      '- Client IP address:', req.ip || 'No IP!',
      '- Session:', _.omit(req.session, ['save', 'cookie'])
    ]);

    return this.logErrors.apply(this, logEntries);
  },

  logErrors: function () {
    for (var i = 0, j = arguments.length; i < j; i++) {
      sails.log.error(arguments[i]);
    }

    sails.log.error(':: [' + this.dateString() + '] End report');
  }
};
