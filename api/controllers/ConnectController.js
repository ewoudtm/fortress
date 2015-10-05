/**
 * ConnectController
 *
 * @description :: Server-side logic for managing connects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  getCookie: function(req, res) {
    var content = '// C is for Cookie';

    res.header('Content-type','text/javascript');
    res.header('Access-Control-Allow-Origin','*');

    if (req.query.callback) {
      content = req.query.callback + "(true);";
    }

    res.send(content);
  },

  safariGetCookie : function (req, res) {
    return res.redirect(req.header('referer') || null);
  }
};
