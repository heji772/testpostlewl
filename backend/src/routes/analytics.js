const express = require('express');
const { recordEvent } = require('../services/analyticsService');
const { validateAnalyticsPayload } = require('../utils/validation');
const { analyticsRateLimiter } = require('../middleware/rateLimiters');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.post('/track', analyticsRateLimiter, auditLogger('analytics:track'), async (req, res, next) => {
  try {
    const payload = {
      eventType: req.body.eventType,
      sessionId: req.body.sessionId,
      couponId: req.body.couponId,
      ipAddress: req.ip,
    };
    validateAnalyticsPayload(payload);
    await recordEvent(payload);
    res.status(201).json({ success: true });
  } catch (error) {
    if (error.status === 400) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    next(error);
  }
});

module.exports = router;
