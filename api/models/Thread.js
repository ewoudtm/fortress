module.exports = {
  schema: true,
  attributes: {
    messages: {
      collection: 'message',
      via: 'thread'
    },
    subject: 'string',
    from: {
      model: 'user'
    },
    to: {
      model: 'user'
    }
  }
};
