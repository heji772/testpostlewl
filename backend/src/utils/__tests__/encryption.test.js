const path = require('path');

describe('encryption utility', () => {
  const ORIGINAL_ENV = process.env;
  const validKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, ENCRYPTION_KEY: validKey };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('encrypts and decrypts payloads symmetrically', () => {
    const { encrypt, decrypt } = require(path.join('..', '..', 'utils', 'encryption'));
    const payload = { message: 'secret', nested: { num: 42 } };

    const encrypted = encrypt(payload);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.split(':')).toHaveLength(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(payload);
  });

  test('throws when encryption key is invalid', () => {
    process.env.ENCRYPTION_KEY = '123';
    const { encrypt } = require(path.join('..', '..', 'utils', 'encryption'));
    expect(() => encrypt({ test: true })).toThrow('Encryption key must be a 64 character hexadecimal string');
  });
});
