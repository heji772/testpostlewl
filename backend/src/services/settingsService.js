const { SecuritySetting } = require('../models');

const DEFAULT_SETTINGS = {
  anonymizeData: true,
  autoDeleteDays: 30,
  autoDeleteEnabled: false,
  enableRateLimit: false,
  rateLimit: 120,
};

function sanitizeSettings(settingInstance) {
  const setting = settingInstance.get({ plain: true });
  return {
    anonymizeData: Boolean(setting.anonymizeData),
    autoDeleteDays: setting.autoDeleteDays,
    autoDeleteEnabled: Boolean(setting.autoDeleteEnabled),
    enableRateLimit: Boolean(setting.enableRateLimit),
    rateLimit: setting.rateLimit,
  };
}

async function loadSettings() {
  const [setting] = await SecuritySetting.findOrCreate({
    where: { id: 1 },
    defaults: DEFAULT_SETTINGS,
  });
  return setting;
}

function coerceBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
}

function createValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function getSecuritySettings() {
  const setting = await loadSettings();
  return sanitizeSettings(setting);
}

async function updateSecuritySettings(updates = {}) {
  const setting = await loadSettings();

  if (Object.prototype.hasOwnProperty.call(updates, 'anonymizeData')) {
    const value = coerceBoolean(updates.anonymizeData);
    if (value === undefined) {
      throw createValidationError('anonymizeData must be a boolean value');
    }
    setting.anonymizeData = value;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'autoDeleteEnabled')) {
    const value = coerceBoolean(updates.autoDeleteEnabled);
    if (value === undefined) {
      throw createValidationError('autoDeleteEnabled must be a boolean value');
    }
    setting.autoDeleteEnabled = value;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'enableRateLimit')) {
    const value = coerceBoolean(updates.enableRateLimit);
    if (value === undefined) {
      throw createValidationError('enableRateLimit must be a boolean value');
    }
    setting.enableRateLimit = value;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'autoDeleteDays')) {
    const value = Number.parseInt(updates.autoDeleteDays, 10);
    if (Number.isNaN(value) || value < 1 || value > 365) {
      throw createValidationError('autoDeleteDays must be an integer between 1 and 365');
    }
    setting.autoDeleteDays = value;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'rateLimit')) {
    const value = Number.parseInt(updates.rateLimit, 10);
    if (Number.isNaN(value) || value < 1 || value > 10000) {
      throw createValidationError('rateLimit must be an integer between 1 and 10000');
    }
    setting.rateLimit = value;
  }

  await setting.save();
  return sanitizeSettings(setting);
}

module.exports = {
  getSecuritySettings,
  updateSecuritySettings,
};
