var objectCache = {},
    objectIdMap = {};

module.exports = {

  resolve : function(hostOrId, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    // First check by hostname
    if (objectCache[hostOrId]) {
      return callback(null, objectCache[hostOrId]);
    }

    // Then check by object ID
    if (objectIdMap[hostOrId]) {
      return callback(null, objectIdMap[hostOrId]);
    }

    // Ids (not even in mongo) don't contains dots.
    if (hostOrId.toString().search(/\./) > -1) {
      hostOrId = {host: hostOrId};
    }

    sails.models.object.findOne(hostOrId, function(error, object) {

      if (error) {
        return callback(error);
      }

      if (!object) {
        return callback({error: 'unknown_object'});
      }

      objectCache[object.host] = object;
      objectIdMap[object.id]   = object;

      callback(null, object);
    });
  }
};
