module.exports = function (req, res, next) {

  req.options.where = {
    or: [
      {
        to: req.session.user,
        toArchived: false
      },
      {
        from: req.session.user,
        fromArchived: false
      }
    ]
  };

  next();
};
