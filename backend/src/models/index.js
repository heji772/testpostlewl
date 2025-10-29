const sequelize = require('../config/database');
const Coupon = require('./Coupon')(sequelize);
const Victim = require('./Victim')(sequelize);
const Analytics = require('./Analytics');

module.exports = {
  sequelize,
  Coupon,
  Victim,
  Analytics,
};
