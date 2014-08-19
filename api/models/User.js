var roles = ['visitor', 'performer'], userModel = {schema: true};

/**
 * The attributes for the model.
 */
userModel.attributes = {

  username: {
    type  : 'string',
    unique: true,
    index : true,
    regex : /^[\w-]{2,14}$/
  },

  email: {
    type: 'email'
  },

  socketId: {
    type      : 'string',
    defaultsTo: null
  },

  password: {
    type      : 'string',
    defaultsTo: null
  },

  partnerCode: {
    type      : 'string',
    defaultsTo: 61
  },

  partnerInfo: {
    type      : 'string',
    defaultsTo: 'typein'
  },

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
 * Get all valid roles
 * @returns {string[]}
 */
userModel.getValidRoles = function () {
  return roles;
};

/**
 * Check if supplied role is valid.
 * @param role
 * @returns {boolean}
 */
userModel.isValidRole = function (role) {
  return roles.indexOf(role) > -1;
};

function register(userCredentials, callback) {
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

      var role = userRoles.shift(), model = sails.models[role];

      // @todo sort out this HACK. This is because sails doesn't work well with custom primary keys.
      if ('id' === model.primaryKey) {
        model.update(newUser[role], {user: newUser.id}).exec(function (error, updated) {
          newUser[role] = updated[0];

          if (error) {
            return callback(error);
          }

          next();
        });

        return;
      }

      // Set the ID of the newly added user to ensure a functional association.
      userRoleObjects[role].user = newUser.id;
      model.create(userRoleObjects[role]).exec(function (error, newAccountType) {
        if (error) {
          return callback(error);
        }

        // Set newly created account type on newly created user (remove the need to populate later on)
        newUser[role] = newAccountType;

        // On to the next role.
        next();
      });
    })();
  });
}

/**
 * Register a new user. Allows supplying nested account types such as performer and visitor.
 *
 * @param {{}}       userCredentials
 * @param {Function} callback
 */
userModel.register = function (userCredentials, callback) {

  if (!userCredentials.username) {
    return register(userCredentials, callback);
  }

  sails.services.userservice.usernameAvailable(userCredentials.username, function (error, available) {
    if (error) {
      return callback(error);
    }

    if (!available) {
      return callback({error: 'username_exists'});
    }

    register(userCredentials, callback);
  });
};

module.exports = userModel;
