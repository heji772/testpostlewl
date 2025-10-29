const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const AuthUser = require('../models/AuthUser');

const router = express.Router();

const generateBackupCodes = async () => {
  const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex'));
  const hashedCodes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code, 12)));
  return { backupCodes, hashedCodes };
};

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
      if (!totpToken) {
        return res.status(400).json({ error: 'TOTP token or backup code is required' });
      }

      const totpVerified = user.totpSecret
        ? speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token: String(totpToken),
            window: 1,
          })
        : false;

      let backupCodeUsed = false;

      if (!totpVerified && Array.isArray(user.totpBackupCodes) && user.totpBackupCodes.length > 0) {
        const existingCodes = [...user.totpBackupCodes];
        for (let i = 0; i < existingCodes.length; i += 1) {
          const hashedCode = existingCodes[i];
          const matches = await bcrypt.compare(String(totpToken), hashedCode);
          if (matches) {
            backupCodeUsed = true;
            existingCodes.splice(i, 1);
            user.totpBackupCodes = existingCodes;
            await user.save();
            break;
          }
        }
      }

      if (!totpVerified && !backupCodeUsed) {
        return res.status(401).json({ error: 'Invalid TOTP token or backup code' });
      }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ token, success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process login request' });
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
  const { username, token } = req.body;

  if (!username || !token) {
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
      token: String(token),
      window: 1,
    });

    if (!isVerified) {
      return res.status(400).json({ error: 'Invalid TOTP token' });
    }

    const { backupCodes, hashedCodes } = await generateBackupCodes();

    user.totpSecret = user.totpTempSecret;
    user.totpTempSecret = null;
    user.totpEnabled = true;
    user.totpBackupCodes = hashedCodes;
    await user.save();

    return res.json({ success: true, backupCodes });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify TOTP setup' });
  }
});

module.exports = router;
