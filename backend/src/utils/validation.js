const validator = require('validator');

function collectErrors(errors) {
  if (errors.length) {
    const error = new Error(`Validation error: ${errors.join(', ')}`);
    error.status = 400;
    throw error;
  }
}

function validateLoginPayload({ username, password }) {
  const errors = [];
  if (!validator.isLength(`${username || ''}`, { min: 1 })) {
    errors.push('username is required');
  }
  if (!validator.isLength(`${password || ''}`, { min: 1 })) {
    errors.push('password is required');
  }
  collectErrors(errors);
}

function validateVictimPayload(data) {
  const errors = [];
  if (!validator.isLength(`${data.sessionId || ''}`, { min: 1, max: 255 })) {
    errors.push('sessionId is required');
  }
  if (data.email && !validator.isEmail(data.email)) {
    errors.push('email must be valid');
  }
  if (data.phone && !validator.isMobilePhone(data.phone + '', 'any')) {
    errors.push('phone must be valid');
  }
  if (data.birthDate && !validator.isISO8601(data.birthDate)) {
    errors.push('birthDate must be ISO8601 date');
  }
  collectErrors(errors);
}

function validateCouponPayload(data) {
  const errors = [];
  if (!validator.isLength(`${data.title || ''}`, { min: 1, max: 255 })) {
    errors.push('title is required');
  }
  if (data.brand && !validator.isLength(`${data.brand}`, { max: 100 })) {
    errors.push('brand is too long');
  }
  if (data.category && !validator.isLength(`${data.category}`, { max: 50 })) {
    errors.push('category is too long');
  }
  if (data.discountText && !validator.isLength(`${data.discountText}`, { max: 100 })) {
    errors.push('discountText is too long');
  }
  if (data.code && !validator.isLength(`${data.code}`, { max: 50 })) {
    errors.push('code is too long');
  }
  collectErrors(errors);
}

function validateAnalyticsPayload(data) {
  const allowedEvents = ['view', 'click', 'submit'];
  const errors = [];
  if (!allowedEvents.includes(data.eventType)) {
    errors.push(`eventType must be one of ${allowedEvents.join(', ')}`);
  }
  if (data.sessionId && !validator.isLength(`${data.sessionId}`, { max: 255 })) {
    errors.push('sessionId is too long');
  }
  collectErrors(errors);
}

module.exports = {
  validateLoginPayload,
  validateVictimPayload,
  validateCouponPayload,
  validateAnalyticsPayload,
};
