module.exports = function (req, res, next) {
  req.options = {
    where: {
      user : req.session.user
    }
  };

  next();
};
