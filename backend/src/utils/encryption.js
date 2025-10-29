const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended length for GCM

function resolveKey(providedKey = process.env.ENCRYPTION_KEY) {
  if (!providedKey) {
    throw new Error('Encryption key is not configured');
  }

  if (!/^[0-9a-fA-F]{64}$/.test(providedKey)) {
    throw new Error('Encryption key must be a 64 character hexadecimal string');
  }

  return Buffer.from(providedKey, 'hex');
}

function encrypt(data, key) {
  const keyBuffer = resolveKey(key);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  const jsonPayload = typeof data === 'string' ? data : JSON.stringify(data);
  let encrypted = cipher.update(jsonPayload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(payload, key) {
  const keyBuffer = resolveKey(key);

  if (typeof payload !== 'string') {
    throw new Error('Encrypted payload must be a string');
  }

  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('Encrypted payload format is invalid');
  }

  const [ivHex, authTagHex, encrypted] = parts;
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Encrypted payload is incomplete');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch (_err) {
    return decrypted;
  }
}

module.exports = {
  encrypt,
  decrypt,
};
