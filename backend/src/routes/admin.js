const express = require('express');
const { getCoupons, createCoupon } = require('../services/couponService');
const { listVictims } = require('../services/victimService');
const { getStats } = require('../services/analyticsService');
const { getSecuritySettings, updateSecuritySettings } = require('../services/settingsService');
const { validateCouponPayload } = require('../utils/validation');
const auditLogger = require('../middleware/auditLogger');
const AuthUser = require('../models/AuthUser');
const { generateBackupCodes } = require('../utils/backupCodes');

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

router.get('/settings', auditLogger('admin:get-settings'), async (_req, res, next) => {
  try {
    const settings = await getSecuritySettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/settings', auditLogger('admin:update-settings'), async (req, res, next) => {
  try {
    const settings = await updateSecuritySettings(req.body || {});
    res.json(settings);
  } catch (error) {
    if (error.status === 400) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});

router.post(
  '/settings/backup-codes',
  auditLogger('admin:generate-backup-codes'),
  async (req, res, next) => {
    try {
      const user = await AuthUser.findByPk(req.user?.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (!user.totpEnabled) {
        res.status(400).json({ error: 'Two-factor authentication is not enabled' });
        return;
      }

      const { codes, hashedCodes } = await generateBackupCodes();
      user.totpBackupCodes = hashedCodes;
      await user.save();

      res.status(201).json({ codes });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
