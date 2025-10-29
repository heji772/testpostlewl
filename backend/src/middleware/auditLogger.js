const logger = require('../utils/logger');

function auditLogger(action) {
  return (req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      logger.info('AUDIT', {
        action,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        user: req.user ? req.user.username : undefined,
        durationMs: Date.now() - startedAt,
      });
    });
    next();
  };
}

module.exports = auditLogger;
