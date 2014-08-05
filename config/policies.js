module.exports.policies = {

  // Default policy for all controllers and actions
  // (`true` allows public access)
  '*': false,

  MessageController: {
    create   : ['isAuthenticated', 'hasUsername', 'complementReply'],
    inbox    : ['isAuthenticated'],
    find     : ['isAuthenticated', 'ensureThreadParticipation'],
    markRead : ['isAuthenticated'],
    unread   : ['isAuthenticated'],
    getCount : ['isAuthenticated']
  },

  ConnectController: {
    getcookie: true
  },

  UserController: {
    login      : true,
    getUsername: true,
    getIdentity: 'isAuthenticated'
  },

  VisitorController: {
    find       : ['isAuthenticated', 'resolveVisitorIdentity', 'ownsVisitorRecord'],
    setUsername: ['isAuthenticated', 'isVisitor']
  },

  ThreadController: {
    create  : ['isAuthenticated', 'hasUsername', 'complementNewThread'],
    findOne : ['isAuthenticated', 'hasUsername'],
    markRead: ['isAuthenticated']
  },

  PerformerController: {
    find: true
  }
};
