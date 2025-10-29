const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    url: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: 'coupons',
    underscored: true,
  });

  return Coupon;
};
