module.exports = function (req, res, next) {

//  req.options.where = {
//    or: [
//      {to: req.session.user},
//      {from: req.session.user}
//    ],
//    thread: req.param('thread')
//  };

  next();
};
