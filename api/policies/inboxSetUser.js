/**
 * Set to find where to = authenticated user's id, or from = authenticated user's id.
 */
module.exports = function(req, res, next) {

  if (req.route.path !== '/message/inbox') {
    return next();
  }

  if (!req.session || !req.session.user) {
    return res.badRequest();
  }

  var userId = req.session.user;

  req.body = {
    where: {
      or: [
        {
          to: userId
        },
        {
          from: userId
        }
      ]
    },
    groupBy: 'thread',
    sort: 'updatedAt desc'
  };

  console.log(req.body);

  next();
};
