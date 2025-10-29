const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AnalyticsEvent = sequelize.define('AnalyticsEvent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventType: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
  }, {
    tableName: 'analytics_events',
    underscored: true,
  });

  return AnalyticsEvent;
};
