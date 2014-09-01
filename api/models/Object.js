/**
 * Visitor belongs to object.
 *
 * @todo Check register, and verify username and email are unique for Object (rather than globally).
 * @todo Remember that messages don't have to be coupled with Object, because they're coupled with Users, which are coupled with Objects.
 *
 * @type {{attributes: {domain: string, programId: string}}}
 */
module.exports = {
  attributes: {
    host: 'string',

    partnerCode: 'integer',

    partnerInfo: 'string'
  }
};
