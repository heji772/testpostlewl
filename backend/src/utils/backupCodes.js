const crypto = require('crypto');
const bcrypt = require('bcrypt');

async function generateBackupCodes(count = 8) {
  const codes = Array.from({ length: count }, () => crypto.randomBytes(4).toString('hex'));
  const hashedCodes = await Promise.all(codes.map((code) => bcrypt.hash(code, 12)));
  return { codes, hashedCodes };
}

module.exports = {
  generateBackupCodes,
};
