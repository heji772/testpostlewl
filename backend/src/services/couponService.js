const { Coupon } = require('../models');
const logger = require('../utils/logger');

function parseBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    if (normalised === 'true') return true;
    if (normalised === 'false') return false;
  }

  return undefined;
}

function toBaseCoupon(couponInstance) {
  const plain = couponInstance.get ? couponInstance.get({ plain: true }) : couponInstance;
  const discountText = plain.discountText ?? plain.discount_text ?? null;
  const isPhishing = plain.isPhishing ?? plain.is_phishing ?? false;
  const imageUrl = plain.imageUrl ?? plain.image_url ?? null;
  const ctaUrl = plain.ctaUrl ?? plain.cta_url ?? plain.url ?? null;
  const createdAt = plain.createdAt ?? plain.created_at ?? null;

  return {
    id: plain.id,
    title: plain.title,
    brand: plain.brand,
    category: plain.category,
    discountText,
    code: plain.code,
    isPhishing,
    imageUrl,
    ctaUrl,
    createdAt,
  };
}

function formatCoupon(baseCoupon, format = 'camel') {
  if (format === 'snake') {
    return {
      id: baseCoupon.id,
      title: baseCoupon.title,
      brand: baseCoupon.brand,
      category: baseCoupon.category,
      discount_text: baseCoupon.discountText,
      code: baseCoupon.code,
      is_phishing: baseCoupon.isPhishing,
      image_url: baseCoupon.imageUrl,
      cta_url: baseCoupon.ctaUrl,
      created_at: baseCoupon.createdAt,
    };
  }

  return baseCoupon;
}

function toModelPayload(data = {}) {
  const payload = {
    title: data.title,
    brand: data.brand,
    category: data.category,
    discountText: data.discountText ?? data.discount_text ?? null,
    code: data.code,
    imageUrl: data.imageUrl ?? data.image_url ?? null,
    ctaUrl: data.ctaUrl ?? data.cta_url ?? data.url ?? null,
  };

  const isPhishingValue = parseBoolean(
    data.isPhishing !== undefined ? data.isPhishing : data.is_phishing,
  );

  if (isPhishingValue !== undefined) {
    payload.isPhishing = isPhishingValue;
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
}

async function getCoupons(options = {}) {
  const { format = 'camel' } = options;
  const coupons = await Coupon.findAll({ order: [['created_at', 'DESC']] });
  return coupons.map((coupon) => formatCoupon(toBaseCoupon(coupon), format));
}

async function createCoupon(data, options = {}) {
  const { format = 'camel' } = options;
  const modelPayload = toModelPayload(data);
  const coupon = await Coupon.create(modelPayload);
  const base = toBaseCoupon(coupon);

  logger.info('AUDIT: Coupon created', {
    couponId: base.id,
    title: base.title,
    isPhishing: base.isPhishing,
  });

  return formatCoupon(base, format);
}

module.exports = {
  getCoupons,
  createCoupon,
};
