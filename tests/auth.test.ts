import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../src/lib/auth';

describe('Auth & Session Security Module', () => {
  it('should hash and verify passwords correctly using bcrypt', async () => {
    const rawPass = 'SecureTestPassword2026!';
    const hashed = await hashPassword(rawPass);

    expect(hashed).not.toBe(rawPass);
    expect(await verifyPassword(rawPass, hashed)).toBe(true);
    expect(await verifyPassword('WrongPassword123', hashed)).toBe(false);
  });

  it('should create and verify valid JWT session tokens with mustChangePassword flag', async () => {
    const userPayload = {
      id: 'usr_test_123',
      name: 'Test Technician',
      email: 'tech@propdeskit.com',
      role: 'TECHNICIAN',
      mustChangePassword: true,
    };

    const token = await createSessionToken(userPayload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(userPayload.id);
    expect(decoded?.email).toBe(userPayload.email);
    expect(decoded?.role).toBe(userPayload.role);
    expect(decoded?.mustChangePassword).toBe(true);
  });

  it('should reject tampered or invalid JWT session tokens', async () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.signature';
    const result = await verifySessionToken(invalidToken);
    expect(result).toBeNull();
  });
});
