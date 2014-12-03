module.exports.propertyPolicies = {
  user: ['notificationEmail', 'email', 'mailable'], // Whitelist for model `user`
  thread: ['toArchived', 'fromArchived']
};
