var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

function publishDestroy (id, mirror, record, Model) {
  Model.publishDestroy(id, mirror, {previous: record});
}

function unsubscribe (req, record, Model) {
  if (req.isSocket) {
    Model.unsubscribe(req, record);
    Model.retire(record);
  }
}

function pubsub (Model, records, req) {
  var mirror = !sails.config.blueprints.mirror && req;

  if (!Array.isArray(records)) {
    publishDestroy(records.id, mirror, records, Model);
    unsubscribe(req, records, Model);

    return;
  }

  records.forEach(function pubsubRecord (record) {
    publishDestroy(record.id, mirror, records, Model);
    unsubscribe(req, record, Model);
  });
}

module.exports = function destroyRecords (req, res) {
  var Model = actionUtil.parseModel(req),
      findQuery,
      destroyQuery,
      criteria,
      pk;

  // Figure out if this delete is by PK or by criteria.
  if (actionUtil.parsePk(req)) {
    criteria  = actionUtil.requirePk(req);
    findQuery = Model.findOne(criteria);
  } else {
    criteria  = actionUtil.parseCriteria(req);
    findQuery = Model.find(criteria);
  }

  // The query we'll be using for destroying the requested records
  destroyQuery = Model.destroy(criteria);

  // Populate the models the requested model has an association with (as per param).
  actionUtil.populateEach(findQuery, req);

  // Find the records we'll be deleting.
  findQuery.exec(function foundRecords (error, results) {
    if (error) {
      return res.serverError(error);
    }

    // Nothing _failed_. Just, nothing matched.
    if (!results) {
      return res.ok([]);
    }

    // Yeuy we found targets to destroy. Let's exec the destory query.
    destroyQuery.exec(function destroyedRecords (error) {
      if (error) {
        return res.negotiate(error);
      }

      // Cool cool. Do we need to handle pubsub?
      if (sails.hooks.pubsub) {
        pubsub(Model, results, req);
      }

      // All done, return the destroyed record(s).
      return res.ok(results);
    });
  });
};
