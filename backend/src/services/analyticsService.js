const { Analytics } = require('../models');
const logger = require('../utils/logger');

async function recordEvent({ eventType, sessionId, couponId, metadata = {}, ipAddress, userAgent }) {
  const safeMetadata =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};

  const event = await Analytics.create({
    eventType,
    sessionId,
    couponId,
    metadata: safeMetadata,
    ipAddress,
    userAgent,
  });

  logger.info('AUDIT: Analytics event captured', {
    eventType,
    sessionId,
    couponId,
    ipAddress,
    userAgent,
    metadata: safeMetadata,
  });

  return event.get({ plain: true });
}

async function getStats() {
  const [totalViews, totalClicks, totalSubmits, totalEvents] = await Promise.all([
    Analytics.count({ where: { eventType: 'view' } }),
    Analytics.count({ where: { eventType: 'click' } }),
    Analytics.count({ where: { eventType: 'submit' } }),
    Analytics.count(),
  ]);

  return {
    totalViews,
    totalClicks,
    totalSubmits,
    totalEvents,
  };
}

async function getOverview() {
  const [views, clicks, submits] = await Promise.all([
    Analytics.count({ where: { eventType: 'view' } }),
    Analytics.count({ where: { eventType: 'click' } }),
    Analytics.count({ where: { eventType: 'submit' } }),
  ]);

  return {
    totals: {
      views,
      clicks,
      submits,
    },
  };
}

module.exports = {
  recordEvent,
  getStats,
  getOverview,
};
