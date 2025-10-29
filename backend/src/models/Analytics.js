const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Analytics extends Model {}

Analytics.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventType: {
      type: DataTypes.STRING(50),
      field: 'event_type',
    },
    sessionId: {
      type: DataTypes.STRING(255),
      field: 'session_id',
    },
    couponId: {
      type: DataTypes.INTEGER,
      field: 'coupon_id',
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      field: 'ip_address',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'analytics',
    modelName: 'Analytics',
    timestamps: false,
    underscored: true,
  }
);

module.exports = Analytics;
