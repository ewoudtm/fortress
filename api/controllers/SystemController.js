module.exports = {
  totalConnections : function (req, res) {
    res.ok({sessions: Object.keys(sails.io.sockets.sockets).length});
  }
};
