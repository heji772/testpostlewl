const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const AuthUser = require('../models/AuthUser');
const AuthSession = require('../models/AuthSession');
const authenticate = require('../middleware/authenticate');
const { generateBackupCodes } = require('../utils/backupCodes');

const router = express.Router();

const REFRESH_TOKEN_TTL_MS = (Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 30) * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.username,
    role: 'Administrator',
    totpEnabled: Boolean(user.totpEnabled),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function createAccessToken(user, sessionId) {
  return jwt.sign(
    { id: user.id, username: user.username, sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function createSession(user, req) {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenHash = hashToken(refreshToken);
  const now = new Date();
  const session = await AuthSession.create({
    userId: user.id,
    refreshTokenHash,
    expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
    lastUsedAt: now,
  });
  const accessToken = createAccessToken(user, session.id);
  return { accessToken, refreshToken, session };
}

async function rotateSessionToken(session, req) {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  session.refreshTokenHash = hashToken(refreshToken);
  session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  session.lastUsedAt = new Date();
  session.userAgent = req.get('user-agent');
  session.ipAddress = req.ip;
  await session.save();
  return refreshToken;
}

async function verifyTotpOrBackup(user, tokenValue) {
  const value = String(tokenValue || '').trim();
  if (!value) {
    return { success: false };
  }

  const totpVerified = user.totpSecret
    ? speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: value,
        window: 1,
      })
    : false;

  if (totpVerified) {
    return { success: true, usingBackup: false };
  }

  if (Array.isArray(user.totpBackupCodes) && user.totpBackupCodes.length > 0) {
    const existingCodes = [...user.totpBackupCodes];
    for (let i = 0; i < existingCodes.length; i += 1) {
      const hashedCode = existingCodes[i];
      // eslint-disable-next-line no-await-in-loop
      const matches = await bcrypt.compare(value, hashedCode);
      if (matches) {
        existingCodes.splice(i, 1);
        user.totpBackupCodes = existingCodes;
        await user.save();
        return { success: true, usingBackup: true };
      }
    }
  }

  return { success: false };
}

router.post('/login', async (req, res) => {
  const { username, password, totpToken } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT secret is not configured' });
  }

  try {
    const user = await AuthUser.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.totpEnabled) {
      if (totpToken) {
        const verification = await verifyTotpOrBackup(user, totpToken);
        if (!verification.success) {
          return res.status(401).json({ error: 'Invalid TOTP token or backup code' });
        }
      } else {
        const tempToken = jwt.sign(
          { purpose: 'totp-login', userId: user.id },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );
        return res.json({ requiresTotp: true, tempToken });
      }
    }

    const { accessToken, refreshToken } = await createSession(user, req);
    return res.json({ success: true, token: accessToken, refreshToken, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process login request' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT secret is not configured' });
  }

  try {
    const refreshTokenHash = hashToken(refreshToken);
    const session = await AuthSession.findOne({ where: { refreshTokenHash } });
    if (!session || session.revokedAt) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
      session.revokedAt = new Date();
      await session.save();
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    const user = await AuthUser.findByPk(session.userId);
    if (!user) {
      session.revokedAt = new Date();
      await session.save();
      return res.status(401).json({ error: 'Session is no longer valid' });
    }

    const newRefreshToken = await rotateSessionToken(session, req);
    const accessToken = createAccessToken(user, session.id);

    return res.json({ token: accessToken, refreshToken: newRefreshToken, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to refresh session' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    if (req.user?.sessionId) {
      const session = await AuthSession.findByPk(req.user.sessionId);
      if (session && !session.revokedAt) {
        session.revokedAt = new Date();
        await session.save();
      }
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to terminate session' });
  }

  return res.json({ success: true });
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await AuthUser.findByPk(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load user profile' });
  }
});

router.post('/totp/setup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await AuthUser.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.totpEnabled && !user.totpTempSecret) {
      return res.status(400).json({ error: 'TOTP already enabled for this account' });
    }

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `PhishGuard (${user.username})`,
    });

    user.totpTempSecret = secret.base32;
    await user.save();

    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

    return res.json({
      otpauthUrl: secret.otpauth_url,
      base32: secret.base32,
      qrCodeDataURL,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to initiate TOTP setup' });
  }
});

router.post('/totp/verify', async (req, res) => {
  const { token: tempToken, code, username } = req.body || {};

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT secret is not configured' });
  }

  if (tempToken && code && !username) {
    try {
      const payload = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (payload.purpose !== 'totp-login' || !payload.userId) {
        return res.status(400).json({ error: 'Invalid challenge token' });
      }

      const user = await AuthUser.findByPk(payload.userId);
      if (!user || !user.totpEnabled) {
        return res.status(401).json({ error: 'Two-factor authentication is not enabled' });
      }

      const verification = await verifyTotpOrBackup(user, code);
      if (!verification.success) {
        return res.status(401).json({ error: 'Invalid TOTP token or backup code' });
      }

      const { accessToken, refreshToken } = await createSession(user, req);
      return res.json({ success: true, token: accessToken, refreshToken, user: sanitizeUser(user) });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid or expired challenge token' });
      }
      return res.status(500).json({ error: 'Failed to verify TOTP challenge' });
    }
  }

  const totpCode = code || req.body?.token;

  if (!username || !totpCode) {
    return res.status(400).json({ error: 'Username and token are required' });
  }

  try {
    const user = await AuthUser.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.totpTempSecret) {
      return res.status(400).json({ error: 'No TOTP setup in progress' });
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.totpTempSecret,
      encoding: 'base32',
      token: String(totpCode),
      window: 1,
    });

    if (!isVerified) {
      return res.status(400).json({ error: 'Invalid TOTP token' });
    }

    const { codes, hashedCodes } = await generateBackupCodes();

    user.totpSecret = user.totpTempSecret;
    user.totpTempSecret = null;
    user.totpEnabled = true;
    user.totpBackupCodes = hashedCodes;
    await user.save();

    return res.json({ success: true, backupCodes: codes });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify TOTP setup' });
  }
});

module.exports = router;
