module.exports = function (req, res, next) {
  var partnerInfo = req.param('partnerInfo');

  if (!partnerInfo) {
    return next();
  }

  if (!partnerInfo.partnerCode) {
    partnerInfo.partnerCode = req.object.partnerCode;
  }

  if (!partnerInfo.partnerInfo) {
    partnerInfo.partnerInfo = req.object.partnerInfo;
  }

  req.partnerInfo = partnerInfo;

  req.query && delete req.query.partnerInfo;
  req.body && delete req.body.partnerInfo;
  req.params && delete req.params.partnerInfo;

  next();
};
