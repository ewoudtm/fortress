module.exports = {
  schema: true,
  attributes: {
    messages: {
      collection: 'message',
      via: 'thread'
    },
    subject: 'email',
    from: {
      model: 'user'
    },
    to: {
      model: 'user'
    }
  }
};
