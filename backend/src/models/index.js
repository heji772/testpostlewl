const sequelize = require('../config/database');
const Coupon = require('./Coupon')(sequelize);
const Victim = require('./Victim')(sequelize);
const Analytics = require('./Analytics');
const AnalyticsEvent = require('./analyticsEvent')(sequelize);

module.exports = {
  sequelize,
  Coupon,
  Victim,
  Analytics,
  AnalyticsEvent,
};
