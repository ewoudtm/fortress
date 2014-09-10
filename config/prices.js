/**
 * @todo Set up dynamic solution with a model. This way, we can add exceptions to these rules.
 */
module.exports.prices = {
  'thread.create': {
    label   : 'Regular message. New.',
    type    : 'purchase',
    currency: 'credits',
    amount  : 60,
    paytype : 'clientmessage'
  },

  'message.create': {
    label   : 'Regular message. Reply.',
    type    : 'purchase',
    currency: 'credits',
    amount  : 60,
    paytype : 'clientmessage'
  }

  /*
  'skeleton.action': { // controller.action
    label   : 'Description for bundle',
    type    : 'purchase', // purchase, access
    currency: 'credits', // credits, euro, minutes
    amount  : '1', // 1 for 1 message, any number for amount of credits or $currency cents (with type access)
    paytype : 'clientppt' // clientmessage, clientppt, clientppm, clientppmvip
  }
  */
};
