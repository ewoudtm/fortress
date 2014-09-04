var objectCache = {};

module.exports = {
  resolve : function(hostname, callback) {
    callback = callback || function () {
      // Just here to avoid errors.
    };

    if (objectCache[hostname]) {
      callback(null, objectCache[hostname]);

      return objectCache[hostname];
    }

    sails.models.object.findOne({host : hostname}, function(error, object) {
      if (error) {
        return callback(error);
      }

      if (!object) {
        return callback({error: 'unknown_object'});
      }

      objectCache[hostname] = object;

      callback(null, objectCache[hostname]);
    });
  }
};
