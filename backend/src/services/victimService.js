const { Victim } = require('../models');
const { encrypt } = require('../utils/encryption');
const logger = require('../utils/logger');

function encryptField(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return encrypt(value);
}

async function saveVictim({
  sessionId,
  firstName,
  lastName,
  email,
  phone,
  address,
  birthDate,
  ipAddress,
  couponId,
}) {
  const payload = {
    sessionId,
    firstNameEncrypted: encryptField(firstName),
    lastNameEncrypted: encryptField(lastName),
    emailEncrypted: encryptField(email),
    phoneEncrypted: encryptField(phone),
    addressEncrypted: encryptField(address),
    birthDateEncrypted: encryptField(birthDate),
    ipAddress,
    couponId,
  };

  const [victim] = await Victim.upsert(payload, { returning: true });

  logger.info('AUDIT: Victim saved', {
    sessionId,
    couponId,
    ipAddress,
  });

  return victim.get({ plain: true });
}

async function listVictims() {
  const victims = await Victim.findAll({
    attributes: ['id', 'sessionId', 'couponId', 'ipAddress', 'createdAt'],
    order: [['created_at', 'DESC']],
  });

  return victims.map((victim) => victim.get({ plain: true }));
}

module.exports = {
  saveVictim,
  listVictims,
};
