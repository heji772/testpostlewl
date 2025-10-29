const { AnalyticsEvent } = require('../models');
const logger = require('../utils/logger');

async function recordEvent({ eventType, sessionId, couponId, ipAddress }) {
  const event = await AnalyticsEvent.create({
    eventType,
    metadata: {
      sessionId: sessionId || null,
      couponId: couponId || null,
    },
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
    AnalyticsEvent.count({ where: { eventType: 'view' } }),
    AnalyticsEvent.count({ where: { eventType: 'click' } }),
    AnalyticsEvent.count({ where: { eventType: 'submit' } }),
    AnalyticsEvent.count(),
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
    AnalyticsEvent.count({ where: { eventType: 'view' } }),
    AnalyticsEvent.count({ where: { eventType: 'click' } }),
    AnalyticsEvent.count({ where: { eventType: 'submit' } }),
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
