const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Victim = sequelize.define('Victim', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'session_id',
    },
    firstNameEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'first_name_encrypted',
    },
    lastNameEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'last_name_encrypted',
    },
    emailEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'email_encrypted',
    },
    phoneEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'phone_encrypted',
    },
    addressEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'address_encrypted',
    },
    birthDateEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'birth_date_encrypted',
    },
    ipAddress: {
      type: DataTypes.INET,
      allowNull: true,
      field: 'ip_address',
    },
    couponId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'coupon_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: false,
  });

  return Victim;
};
