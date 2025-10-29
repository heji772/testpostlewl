const { Analytics } = require('../models');
const logger = require('../utils/logger');

async function recordEvent({ eventType, sessionId, couponId, ipAddress }) {
  const event = await Analytics.create({
    eventType,
    sessionId,
    couponId,
    ipAddress,
  });

  logger.info('AUDIT: Analytics event captured', {
    eventType,
    sessionId,
    couponId,
    ipAddress,
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

module.exports = {
  recordEvent,
  getStats,
};
