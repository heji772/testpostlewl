const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const SecuritySetting = sequelize.define(
  'SecuritySetting',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    anonymizeData: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'anonymize_data',
    },
    autoDeleteDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      field: 'auto_delete_days',
    },
    autoDeleteEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'auto_delete_enabled',
    },
    enableRateLimit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'enable_rate_limit',
    },
    rateLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 120,
      field: 'rate_limit',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'security_settings',
    underscored: true,
  }
);

module.exports = SecuritySetting;
