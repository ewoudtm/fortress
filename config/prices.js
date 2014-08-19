/**
 * @todo Set up dynamic solution with a model. This way, we can add exceptions to this rule.
 */
module.exports.prices = {
  'thread.create': {
    label   : 'Regular message. New.',
    type    : 'purchase',
    currency: 'credits',
    amount  : 60
  },

  'message.create': {
    label   : 'Regular message. Reply.',
    type    : 'purchase',
    currency: 'credits',
    amount  : 60
  },

  // @todo: All below.
  message_media: {
    type    : 'purchase',
    currency: 'credits',
    amount  : 100
  },

  chat_private: {
    type    : 'access',
    currency: 'credits',
    amount  : 1 // Per second
  },

  chat_vip: {
    type    : 'access',
    currency: 'credits',
    min     : 240,
    amount  : 4 // Per second
  },

  chat_public: {
    type    : 'access',
    currency: 'credits',
    amount  : 0 // Per second. Won't subtract credits, only logs access time
  },

  chat_record: {
    type    : 'purchase',
    currency: 'credits',
    amount  : 300
  },

  stream_rtmp: {
    type    : 'access',
    currency: 'euro',
    amount  : '2' // 2 cents per second.
  },

  stream_hls: {
    type    : 'access',
    currency: 'euro',
    amount  : '4' // 4 cents per second.
  }
};
