const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const logger = require('../utils/logger');

const JWT_EXPIRATION = '1h';

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }

  return value;
}

async function login({ username, password }) {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const passwordHash = getRequiredEnv('ADMIN_PASSWORD_HASH');
  const jwtSecret = getRequiredEnv('JWT_SECRET');

  if (username !== adminUsername) {
    return { success: false, message: 'Invalid credentials' };
  }

  const passwordMatches = await bcrypt.compare(password, passwordHash);
  if (!passwordMatches) {
    return { success: false, message: 'Invalid credentials' };
  }

  const token = jwt.sign({ username: adminUsername }, jwtSecret, { expiresIn: JWT_EXPIRATION });

  let totpSetup = null;
  const existingTotpSecret = process.env.ADMIN_TOTP_SECRET;
  if (!existingTotpSecret) {
    const generatedSecret = speakeasy.generateSecret({
      name: process.env.TOTP_APP_NAME || 'PhishGuard Admin',
    });

    const qrCodeDataUrl = await qrcode.toDataURL(generatedSecret.otpauth_url);
    totpSetup = {
      secret: generatedSecret.base32,
      otpauthUrl: generatedSecret.otpauth_url,
      qrCodeDataUrl,
    };
  }

  logger.info('AUDIT: Admin login', { username: adminUsername });

  return {
    success: true,
    token,
    totpSetupRequired: !existingTotpSecret,
    totpSetup,
  };
}

module.exports = {
  login,
};
