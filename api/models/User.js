var roles     = ['visitor', 'performer'],
    bcrypt    = require('bcrypt'),
    userModel = {schema: true};

/**
 * The attributes for the model.
 */
userModel.attributes = {
  username: {
    type : 'string',
    index: true,
    regex: /^[\w\-]{2,14}$/
  },

  password: {
    type      : 'string',
    defaultsTo: null
  },

  email: {
    type    : 'email',
    required: true,
    index   : true
  },

  notificationEmail: {
    type    : 'email',
    index   : true
  },

  /**
   * If user verified the email address.
   */
  notificationEmailVerified: {
    type      : 'boolean',
    defaultsTo: false,
    index     : true
  },

  country: {
    type      : 'string',
    defaultsTo: null, // Performers, I suppose.
    index     : true
  },

  object: {
    model   : 'object',
    index   : true,
    notEmpty: true
  },

  /**
   * If user verified the email address.
   */
  emailVerified: {
    type      : 'boolean',
    defaultsTo: false,
    index     : true
  },

  /**
   * If user has opted out from receiving email.
   */
  mailable: {
    type      : 'boolean',
    defaultsTo: true,
    index     : true
  },

  socketId: {
    type      : 'string',
    index     : true,
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
    var modelInstance = this.toObject();

    delete modelInstance.password;

    modelInstance._modelName = 'user';

    return modelInstance;
  }
};

/**
 * Hash a password
 *
 * @param {string}   password
 * @param {function} callback
 */
function hashPassword (password, callback) {
  bcrypt.hash(password, 8, callback);
}

/**
 * Usage for outside-world code
 *
 * @type {hashPassword}
 */
userModel.hashPassword = hashPassword;

/**
 * Minor overhead. When updating a user, the password gets re-hashed.
 *
 * @param {{}}       values
 * @param {function} callback
 */
userModel.beforeUpdate = function (values, callback) {
  var self     = this,
      password = values.password;

  if (values.notificationEmail) {
    values.notificationEmailVerified = false;
  }

  if (values.email) {
    values.emailVerified = false;
  }

  // if password not set or already hashed
  // todo: create a passwordHash column and delete the password before saving
  if (!password || (password.length == 60 && password.indexOf('$2a$08$') === 0)) {
    return callback();
  }

  hashPassword(password, function (error, hash) {
    if (error) {
      return callback(error);
    }

    values.password = hash;

    callback();
  });
};

/**
 * I.. *sigh*.. The wallet has email addresses with trailing spaces...? Just, yeah.
 *
 * @param {{}}       values
 * @param {function} done
 */
userModel.beforeValidate = function (values, done) {
  if (typeof values.email !== 'string') {
    return done();
  }

  values.email = values.email.trim();

  done();
};

/**
 * Before creating a new user record, do this.
 *
 * @param values
 * @param callback
 */
userModel.beforeCreate = function (values, callback) {
  values.email = values.email.toLowerCase();

  function setGeo () {
    if (!values.ip) {
      return callback();
    }

    sails.services.geoservice.getCountry(values.ip, function (error, country) {
      if (error) {
        return callback(error);
      }

      values.country = country;

      delete values.ip;

      callback();
    });
  }

  if (!values.password) {
    return setGeo();
  }

  hashPassword(values.password, function (error, hash) {
    if (error) {
      return callback(error);
    }

    values.password = hash;

    if (!values.ip) {
      return callback();
    }

    setGeo();
  });
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

function register (userCredentials, callback) {
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
    (function next () {

      // No more roles to check. We're done.
      if (userRoles.length === 0) {
        return callback(null, newUser);
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
 * @param {Function} isPerformer
 */
userModel.register = function (userCredentials, callback, isPerformer) {
  var self = this;

  sails.services.userservice.wouldBeDuplicate(userCredentials, function (error, wouldBe) {
    if (error) {
      return callback(error);
    }

    if (wouldBe && (!isPerformer || wouldBe === 'username')) {
      return callback({
        error   : 'user_exists',
        property: wouldBe
      });
    }

    register.call(self, userCredentials, callback);
  });
};

module.exports = userModel;
