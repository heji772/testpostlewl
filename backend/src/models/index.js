const sequelize = require('../config/database');
const Coupon = require('./Coupon')(sequelize);
const Victim = require('./Victim')(sequelize);
const AnalyticsEvent = require('./analyticsEvent')(sequelize);
const SecuritySetting = require('./SecuritySetting');

module.exports = {
  sequelize,
  Coupon,
  Victim,
  AnalyticsEvent,
  SecuritySetting,
};
