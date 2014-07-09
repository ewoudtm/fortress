var roles = ['visitor', 'performer']
  , userModel = {};

/**
 * The attributes for the model.
 */
userModel.attributes = {

  username: {
    type  : 'string',
    unique: true,
    index : true
  },

  email: {
    type  : 'string',
    unique: true
  },

  socketId: {
    type      : 'string',
    defaultsTo: null
  },

  password: 'string',

  roles: {
    type      : 'array',
    defaultsTo: ['visitor']
  },

  /**
   * Method which removes the password from the entity on-fetch.
   * We never want to send out this sensitive information.
   *
   * @returns {Object}
   */
  toJSON: function () {
    var userInstance = this.toObject();

    delete userInstance.password;

    return userInstance;
  }
};

/*
 * Dynamically add all roles as attributes based off of variable.
 */
roles.forEach(function (role) {
  userModel.attributes[role] = {model: role};
});

/**
 * Register a new user. Allows supplying nested account types such as performer and visitor.
 *
 * @param {{}}       userCredentials
 * @param {Function} callback
 */
userModel.register = function (userCredentials, callback) {

  var userRoleObjects = {};

  // Populate the roles to be created, because sails changes the references.
  roles.forEach(function (role) {
    if (typeof userCredentials[role] !== 'undefined') {
      userRoleObjects[role] = _.extend(userCredentials[role]);
    }
  });

  // Create the new user.
  this.create(userCredentials).exec(function (error, newUser) {
    if (error) {
      return callback(error);
    }

    // Roles to use for loopin'
    var userRoles = Object.getOwnPropertyNames(userRoleObjects);

    // Iterate over roles and create them when needed.
    (function next() {

      // No more roles to check. We're done.
      if (userRoles.length === 0) {
        callback(null, newUser);

        return;
      }

      var role = userRoles.shift();

      // There hasn't been supplied anything for this role, so no need to create.
      if (typeof userRoleObjects[role] === 'undefined') {
        return next();
      }

      // Set the ID of the newly added user to ensure a functional association.
      userRoleObjects[role].user = newUser.id;

      sails.models[role].update(newUser[role], {user: newUser.id}).exec(function (error) {
        if (error) {
          return callback(error);
        }

        next();
      });
    })();
  });
};

module.exports = userModel;
