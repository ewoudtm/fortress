module.exports.policies = {

  // Default policy for all controllers and actions
  // (`true` allows public access)
  '*': false,

  MessageController: {
    create  : ['isAuthenticated', 'hasUsername', 'subtractCredits', 'complementReply'],
    inbox   : ['isAuthenticated'], // Protected in action
    find    : ['isAuthenticated', 'ensureParticipation'],
    markRead: ['isAuthenticated'], // Protected in action
    unread  : ['isAuthenticated']  // Protected in action
  },

  ConnectController: {
    getcookie: true
  },

  UserController: {
    login            : true,
    loginByHash      : true,
    getUsername      : true,
    getIdentity      : 'isAuthenticated', // Protected in action
    usernameAvailable: true
  },

  VisitorController: {
    find       : ['isAuthenticated', 'resolveVisitorIdentity', 'ownsVisitorRecord'],
    setUsername: ['isAuthenticated', 'isVisitor'] // Protected in action
  },

  ThreadController: {
    create        : ['isAuthenticated', 'hasUsername', 'subtractCredits', 'complementNewThread'],
    findonesimple : ['isAuthenticated', 'hasUsername', 'ensureParticipation'],
    markRead      : ['isAuthenticated'], // Protected in action
    find          : 'ensureParticipation',
    getThreadCount: ['isAuthenticated'] // Protected in action
  },

  PerformerController: {
    //find         : true,  // Full search
    //findonesimple: true,  // Search based on username
    //count        : true   // Count based on full search
  }
};
