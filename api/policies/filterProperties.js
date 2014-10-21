var config = sails.config.propertyPolicies;

/**
 * Apply policies to models as to manage access to properties.
 *
 * @todo Make this more robust.
 * @todo Allow short-hand (model: ['whitelist'])
 * @todo Allow blacklisting ({blacklist: ['blacklist']}). Use Object.getOwnProperties(sails.models[model].definition); to extract properties.
 * @todo Allow Default (*) On global, and per-model basis. Could reuse ObjectConfig for that.
 * @todo Allow applying policies (or even specific dir with modelPolicies?)
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports = function(req, res, next) {
  var model = [req.options.model],
      blacklist = [];

  if (!config[model]) {
    return next();
  }

  Object.getOwnPropertyNames(sails.models[model].definition).forEach(function (property) {
    if (config[model].indexOf(property) > -1) {
      return;
    }

    blacklist.push(property);
  });

  if (!req.options.values) {
    req.options.values = {};
  }

  req.options.values.blacklist = blacklist;

  next();
};
