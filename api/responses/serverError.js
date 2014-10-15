module.exports = function serverError (data, details) {

  // Get access to `res`
  var res = this.res,
      alertService = sails.services.alertservice,
      m = new Date(),
      dateString = m.getFullYear() + "/" + (m.getMonth() + 1) + "/" + m.getDate() + " " + m.getHours() + ":" + m.getMinutes() + ":" + m.getSeconds(),
      notificationMessage;

  // Set status code
  res.status(500);

  // Log error to console
  sails.log.error('[' + dateString + '] Report start');
  sails.log.error('Sent 500 ("Server Error") response with:');
  sails.log.error('data - ', data);
  sails.log.error('details - ', details);
  sails.log.error('End report');

  if (data) {
    if (typeof data === 'string') {
      notificationMessage = data + ': ';
    } else if (typeof data.toString === 'function') {
      notificationMessage = data.toString() + ': ';
    }
  }

  if (details) {
    if (typeof details === 'string') {
      notificationMessage += details;
    } else if (typeof details.toString === 'function') {
      notificationMessage += details.toString();
    }

    sails.log.error(details); // Log the error details.
  }

  alertService.push('serverError', notificationMessage || 'res.serverError() invoked!');

  if (!data) {
    return res.jsonp({status: 500});
  }

  if (typeof data !== 'object' || data instanceof Error) {
    data = {error: data};
  }

  data.status = 500;

  res.jsonp(data);
};
