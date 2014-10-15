/**
 * Visitor belongs to object.
 *
 * @type {{attributes: {domain: string, programId: string}}}
 */
module.exports = {
  attributes: {
    host: {
      type  : 'string',
      unique: true,
      index : true
    },

    partnerCode: 'integer',

    partnerInfo: 'string',

    config: 'json',

    email: {
      type : 'email',
      index: true
    }
  }
};
