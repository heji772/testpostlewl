const express = require('express');
const { getCoupons, createCoupon } = require('../services/couponService');
const { listVictims } = require('../services/victimService');
const { getStats } = require('../services/analyticsService');
const { validateCouponPayload } = require('../utils/validation');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.get('/victims', auditLogger('admin:list-victims'), async (_req, res, next) => {
  try {
    const victims = await listVictims();
    res.json({ victims });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', auditLogger('admin:get-stats'), async (_req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/coupons', auditLogger('admin:list-coupons'), async (_req, res, next) => {
  try {
    const coupons = await getCoupons();
    res.json({ coupons });
  } catch (error) {
    next(error);
  }
});

router.post('/coupons', auditLogger('admin:create-coupon'), async (req, res, next) => {
  try {
    const payload = {
      title: req.body.title,
      brand: req.body.brand,
      category: req.body.category,
      discountText: req.body.discountText,
      code: req.body.code,
      isPhishing: req.body.isPhishing,
      imageUrl: req.body.imageUrl,
    };
    validateCouponPayload(payload);
    const coupon = await createCoupon(payload);
    res.status(201).json({ coupon });
  } catch (error) {
    if (error.status === 400) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});

module.exports = router;
