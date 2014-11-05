module.exports = {
  dateString: function () {
    var m = new Date();

    return m.getFullYear() + "/" + (m.getMonth() + 1) + "/" + m.getDate() + " " + m.getHours() + ":" + m.getMinutes() + ":" + m.getSeconds();
  },

  error: function () {
    sails.log.error(':: [' + this.dateString() + '] Report start');
    for (var i = 0, j = arguments.length; i < j; i++) {
      sails.log.error(arguments[i]);
    }

    sails.log.error(':: [' + this.dateString() + '] End report');
  }
};
