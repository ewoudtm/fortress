module.exports = {
  connection   : 'trackthis',
  tableName    : 'trackthistracker_trackables_payment',
  migrate      : 'safe',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  autoPK       : false,
  attributes   : {
    date           : 'date',
    website_key    : {
      type      : 'string',
      defaultsTo: 'islive.io'
    },
    domain         : 'string',
    promotor_id    : 'string',
    promotor_info  : 'string',
    promotor_extra : {
      type      : 'string',
      defaultsTo: ''
    },
    sub_type       : 'string',
    product_id     : {
      type      : 'string',
      defaultsTo: 'webcamsv3'
    },
    paytype_id     : 'string',
    payment_type_id: {
      type      : 'string',
      defaultsTo: -2
    },
    user           : 'string',
    sessionid      : 'string',
    unique         : 'string',
    country        : {
      type      : 'string',
      defaultsTo: 'NL'
    },
    amount         : 'string',
    minutes        : 'string',
    ip             : 'string',
    status         : 'string',
    remote_id      : 'string',
    count          : {
      type      : 'string',
      defaultsTo: 1
    },
    end_user       : 'string'
  },

  beforeCreate: function (values, done) {
    var d = values.ip.split('.');

    values.ip = ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
    values.date = new Date();

    done();
  }
};
