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

    var fileName     = stack.getFileName().replace(process.cwd(), ''),
        lineNumber   = stack.getLineNumber(),
        functionName = stack.getFunctionName(),
        logInfo      = fileName + ':' + lineNumber;

    if (functionName) {
      logInfo += ' in function "' + functionName + '"';
    }

    return logInfo;
  }
});

module.exports = {
  dateString: function () {
    var m = new Date();

    return m.getFullYear() + "/" + (m.getMonth() + 1) + "/" + m.getDate() + " " + m.getHours() + ":" + m.getMinutes() + ":" + m.getSeconds();
  },

  error: function () {
    sails.log.error(':: [' + this.dateString() + '] Report start');
    sails.log.error(':: ' + __logInfo);

    for (var i = 0, j = arguments.length; i < j; i++) {
      if (!arguments[i]) {
        continue;
      }

      sails.log.error(arguments[i]);
    }

    sails.log.error(':: [' + this.dateString() + '] End report');
  }
};
