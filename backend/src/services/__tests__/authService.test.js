const path = require('path');
const bcrypt = require('bcrypt');

describe('authService login', () => {
  const ORIGINAL_ENV = process.env;
  const password = 'S3curePassword!';

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD_HASH: bcrypt.hashSync(password, 10),
      JWT_SECRET: 'jwt-secret',
      ADMIN_TOTP_SECRET: '',
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  test('returns JWT token and totp setup data when login succeeds', async () => {
    const { login } = require(path.join('..', 'authService'));
    const result = await login({ username: 'admin', password });

    expect(result.success).toBe(true);
    expect(result.token).toEqual(expect.any(String));
    expect(result.totpSetupRequired).toBe(true);
    expect(result.totpSetup).toEqual(
      expect.objectContaining({ secret: expect.any(String), qrCodeDataUrl: expect.stringContaining('data:image/png;base64') })
    );
  });

  test('fails when credentials are invalid', async () => {
    const { login } = require(path.join('..', 'authService'));
    const result = await login({ username: 'admin', password: 'wrong' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });
});
