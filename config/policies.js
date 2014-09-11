var globalPolicies = [
  'setObject',
  'setPartnerInfo'
];

function makePolicies(policies) {
  if (!Array.isArray(policies)) {
    policies = [policies];
  }

  if (!policies) {
    policies = [];
  }

  policies = globalPolicies.concat(policies);

  return policies;
}

module.exports.policies = {

  // Default policy for all controllers and actions
  // (`true` allows public access)
  '*': false,

  MessageController: {
    create  : makePolicies(['isAuthenticated', 'hasUsername', 'subtractCredits', 'complementReply', 'track']),
    inbox   : makePolicies(['isAuthenticated']), // Protected in action
    find    : makePolicies(['isAuthenticated', 'ensureParticipation']),
    markRead: makePolicies(['isAuthenticated']), // Protected in action
    unread  : makePolicies(['isAuthenticated'])  // Protected in action
  },

  ConnectController: {
    getcookie: makePolicies(true)
  },

  UserController: {
    login            : makePolicies(true),
    loginByHash      : makePolicies(true),
    getUsername      : makePolicies(true),
    getIdentity      : makePolicies('isAuthenticated'), // Protected in action
    usernameAvailable: makePolicies(true),
    unsubscribe      : makePolicies(true),
    logout           : makePolicies('isAuthenticated')
  },

  VisitorController: {
    find       : makePolicies(['isAuthenticated', 'resolveVisitorIdentity', 'ownsVisitorRecord']),
    setUsername: makePolicies(['isAuthenticated', 'isVisitor']), // Protected in action
    register   : makePolicies(true)
  },

  ObjectController: {
    '*': 'hasMasterIp'
  },

  ThreadController: {
    create        : makePolicies(['isAuthenticated', 'hasUsername', 'subtractCredits', 'complementNewThread', 'track']),
    findonesimple : makePolicies(['isAuthenticated', 'hasUsername', 'ensureParticipation']),
    markRead      : makePolicies(['isAuthenticated']), // Protected in action
    find          : makePolicies('ensureParticipation'),
    getThreadCount: makePolicies(['isAuthenticated']) // Protected in action
  },

  PerformerController: {
    //find         : true,  // Full search
    //findonesimple: true,  // Search based on username
    //count        : true   // Count based on full search
  }
};
