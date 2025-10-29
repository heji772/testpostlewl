const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    discountText: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'discount_text',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isPhishing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_phishing',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'image_url',
    },
    ctaUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cta_url',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  }, {
    tableName: 'coupons',
    timestamps: false,
  });

  return Coupon;
};
