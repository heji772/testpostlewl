require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const bcrypt = require('bcrypt');
const logger = require('./src/utils/logger');
const { sequelize } = require('./src/models');
const AuthUser = require('./src/models/AuthUser');
const { loginRateLimiter } = require('./src/middleware/rateLimiters');
const authenticateJWT = require('./src/middleware/authenticate');

// Routes
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const authRoutes = require('./src/routes/auth');
const analyticsRoutes = require('./src/routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;
const parsedSaltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
const SALT_ROUNDS = Number.isNaN(parsedSaltRounds) ? 12 : parsedSaltRounds;

async function ensureAdminUser() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    try {
      logger.warn('ADMIN_USERNAME or ADMIN_PASSWORD is missing. Skipping admin bootstrap.');
    } catch {}
    return;
  }

  try {
    const existingUser = await AuthUser.findOne({ where: { username } });
    const passwordMatches = existingUser
      ? await bcrypt.compare(password, existingUser.passwordHash)
      : false;

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await AuthUser.create({ username, passwordHash, totpEnabled: false });
      try {
        logger.info('Created default admin account from environment variables.');
      } catch {}
      return;
    }

    if (!passwordMatches) {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await existingUser.update({ passwordHash });
      try {
        logger.info('Synchronized admin password hash with environment variables.');
      } catch {}
    }
  } catch (err) {
    try {
      logger.error(`Failed to ensure admin user exists: ${err.message}`);
    } catch {}
  }
}

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
    await ensureAdminUser();
    app.listen(PORT, '0.0.0.0', () => {
      try { logger.info(`Backend server running on port ${PORT}`); } catch {}
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

start();
