module.exports = function serverError (data, details) {

  var req = this.req,
      res = this.res,
      alertService = sails.services.alertservice,
      notificationMessage;

  // Set status code
  res.status(500);

  sails.services.logservice.error(
    ':: Sent 500 ("Server Error") response with:',
    '- data:', data,
    '- details:', details,
    '- Session:', req.session || 'No session!',
    '- IP address:', req.ip || 'No IP!'
  );

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
