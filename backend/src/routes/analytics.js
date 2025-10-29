const express = require('express');
const { recordEvent } = require('../services/analyticsService');
const { validateAnalyticsPayload } = require('../utils/validation');
const { analyticsRateLimiter } = require('../middleware/rateLimiters');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.post('/track', analyticsRateLimiter, auditLogger('analytics:track'), async (req, res, next) => {
  try {
    const eventType =
      typeof req.body.eventType === 'string' ? req.body.eventType.trim() : req.body.eventType;
    const rawCouponId = req.body.couponId;
    let couponId = null;
    if (typeof rawCouponId === 'number' && Number.isInteger(rawCouponId)) {
      couponId = rawCouponId;
    } else if (typeof rawCouponId === 'string' && /^\d+$/.test(rawCouponId)) {
      couponId = parseInt(rawCouponId, 10);
    }

    const hasMetadata = Object.prototype.hasOwnProperty.call(req.body, 'metadata');
    const metadataForValidation = hasMetadata ? req.body.metadata : undefined;

    const payload = {
      eventType,
      sessionId: req.body.sessionId,
      couponId,
      metadata: metadataForValidation,
      ipAddress: req.ip,
    };

    validateAnalyticsPayload(payload);

    const sanitizedMetadata =
      metadataForValidation && typeof metadataForValidation === 'object' && !Array.isArray(metadataForValidation)
        ? { ...metadataForValidation }
        : {};

    if (couponId === null && rawCouponId !== undefined && rawCouponId !== null) {
      sanitizedMetadata.couponId = rawCouponId;
    }

    await recordEvent({
      ...payload,
      metadata: sanitizedMetadata,
      userAgent: req.get('user-agent'),
    });
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
