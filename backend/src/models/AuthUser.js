const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const AuthUser = sequelize.define(
  'AuthUser',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'password_hash',
    },
    totpSecret: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'totp_secret',
    },
    totpTempSecret: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'totp_temp_secret',
    },
    totpEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'totp_enabled',
    },
    totpBackupCodes: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'totp_backup_codes',
      defaultValue: [],
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
    tableName: 'auth_users',
    underscored: true,
  }
);

module.exports = AuthUser;
