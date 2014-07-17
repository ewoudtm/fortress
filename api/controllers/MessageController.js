module.exports = {
  inbox: function (req, res) {
    var userId = req.session.user
      , threadCriteria = {
          where  : {
            or: [
              {
                to: userId
              },
              {
                from: userId
              }
            ]
          },
          sort   : 'updatedAt desc' // updatedAt gets upped on new reply.
        }
      , messageCriteria = {
          limit: 1,
          sort : 'createdAt desc'
        }
      , findQuery = sails.models['thread'].find().where(threadCriteria);

    findQuery.populate('from').populate('to').populate('messages', messageCriteria);

    findQuery.exec(function (error, results) {
      if (error) {
        return res.json({error  : error});
      }

      res.json(sails.services['messageservice'].flatten(userId, results));
    });
  }
};
