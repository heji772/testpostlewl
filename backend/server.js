require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const logger = require('./src/utils/logger');
const { sequelize } = require('./src/models');
const { loginRateLimiter } = require('./src/middleware/rateLimiters');

// Routes
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const authRoutes = require('./src/routes/auth');
const analyticsRoutes = require('./src/routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

function sanitizeForAudit(body) {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const sanitized = { ...body };
  ['password', 'token', 'secret', 'otp'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      sanitized[key] = '[REDACTED]';
    }
  });
  return sanitized;
}

function auditMiddleware(req, res, next) {
  if (!req.originalUrl.startsWith('/api/admin')) {
    return next();
  }
  const start = Date.now();
  res.on('finish', () => {
    try {
      const duration = Date.now() - start;
      const payload = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        actor: req.user?.username || req.user?.id || 'anonymous',
        ip: req.ip,
        body: sanitizeForAudit(req.body),
        query: req.query,
      };
      logger.info(`[AUDIT] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`, payload);
    } catch (auditError) {
      logger.warn(`Audit logging failed: ${auditError.message}`);
    }
  });
  return next();
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Very simple request log (čisto da imamo nešto)
app.use((req, _res, next) => {
  try { logger.info(`${req.method} ${req.url}`); } catch (err) { logger.warn(err.message); }
  next();
});

app.use(auditMiddleware);

// Health endpoint (tvoj check traži string "ok")
app.get('/health', (_req, res) => res.send('ok'));

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT secret is not configured' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// API routes
app.use('/api/public', publicRoutes);
app.use('/api/auth/login', loginRateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateJWT, adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 za ostalo
app.use((req, res, _next) => {
  return res.status(404).json({ error: 'Not found', path: req.url });
});

// Error handler
app.use((err, _req, res, _next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'Resource already exists.';
  } else if (err instanceof DatabaseError) {
    statusCode = 503;
    message = 'Database is currently unavailable.';
  }

  try { logger.error(err.stack || message); } catch {}

  const response = { error: message };
  if (isDevelopment) {
    response.details = err.errors || err.stack;
  }
  res.status(statusCode).json(response);
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, '0.0.0.0', () => {
      try { logger.info(`Backend server running on port ${PORT}`); } catch {}
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

start();
