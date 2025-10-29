const { Coupon } = require('../models');
const logger = require('../utils/logger');

function toPlain(couponInstance) {
  return couponInstance.get({ plain: true });
}

async function getCoupons() {
  const coupons = await Coupon.findAll({ order: [['created_at', 'DESC']] });
  return coupons.map(toPlain);
}

async function createCoupon({ title, brand, category, discountText, code, isPhishing, imageUrl }) {
  const coupon = await Coupon.create({
    title,
    brand,
    category,
    discountText,
    code,
    isPhishing,
    imageUrl,
  });

  logger.info('AUDIT: Coupon created', {
    couponId: coupon.id,
    title: coupon.title,
    isPhishing: coupon.isPhishing,
  });

  return toPlain(coupon);
}

module.exports = {
  getCoupons,
  createCoupon,
};
