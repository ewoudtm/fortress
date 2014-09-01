var objectCache = {};

module.exports = {
  resolve : function(hostname, callback) {

    if (objectCache[hostname]) {
      return callback(null, objectCache[hostname]);
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
