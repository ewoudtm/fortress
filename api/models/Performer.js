/**
 * @todo as soon as we start using this model, move properties to "profile" model as association.
 */
module.exports = {

  schema: true,

  attributes: {
    user            : {
      model: 'user'
    },
    username        : {
      type  : 'string',
      regex : /^[\w-]{2,14}$/,
      unique: true
    },
    lastLogin       : {
      type : 'date',
      index: true
    },
    dateOfBirth     : {
      type : 'date',
      index: true
    },
    zodiac          : {
      type : 'string',
      index: true
    },
    description     : {
      type : 'text',
      index: true
    },
    languages       : {
      type : 'array',
      index: true
    },
    eyeColor        : {
      type : 'string',
      index: true
    },
    hairColor       : {
      type : 'string',
      index: true
    },
    hobbies         : {
      type: 'string'
    },
    pets            : {
      type: 'string'
    },
    food            : {
      type: 'string'
    },
    drinks          : {
      type: 'string'
    },
    manType         : {
      type: 'string'
    },
    webcamming      : {
      type: 'string'
    },
    sexPosition     : {
      type: 'string'
    },
    sexLocation     : {
      type: 'string'
    },
    turnoff         : {
      type: 'string'
    },
    shaved          : {
      type : 'string',
      index: true
    },
    nicestAboutMe   : {
      type: 'string'
    },
    nicestAboutMen  : {
      type: 'string'
    },
    lifeGoal        : {
      type: 'string'
    },
    motto           : {
      type: 'string'
    },
    sexualPreference: {
      type : 'string',
      index: true
    },
    appearance      : {
      type : 'string',
      index: true
    },
    nationality     : {
      type : 'string',
      index: true
    },
    relationship    : {
      type: 'string'
    },
    smoking         : {
      type: 'string'
    },
    cupSize         : {
      type : 'string',
      index: true
    },
    piercings       : {
      type : 'string',
      index: true
    },
    music           : {
      type: 'string'
    },
    gender          : {
      type : 'string',
      index: true
    },
    online          : {
      defaultsTo: false,
      type      : 'boolean',
      index     : true
    },
    country         : {
      type: 'string'
    },
    city            : {
      type : 'string',
      index: true
    },
    rating          : {
      defaultsTo: -1,
      type      : 'integer',
      index     : true
    },
    ethnicity       : {
      type : 'string',
      index: true
    },
    promoClip       : {
      type: 'string'
    },
    promoClipMobile : {
      type: 'string'
    },
    // Add age.
    toJSON          : function () {
      var obj = this.toObject();

      obj.age = ~~((Date.now() - (+new Date(obj.dateOfBirth))) / (31557600000));

      return obj;
    }
  }
};
