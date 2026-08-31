import { NextResponse } from 'next/server';

// In-memory sliding window rate limiter
interface RateRecord {
  count: number;
  expiresAt: number;
}

const rateStore = new Map<string, RateRecord>();

/**
 * Checks if a given identifier (e.g. IP address) exceeds rate limit thresholds.
 * @param identifier IP or client key
 * @param limit Maximum allowed requests in window
 * @param windowMs Time window in milliseconds (default: 10 minutes)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 10 * 60 * 1000
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateStore.get(identifier);

  // Clean up expired entry or create new record
  if (!record || record.expiresAt < now) {
    rateStore.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetMs: record.expiresAt - now };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetMs: record.expiresAt - now };
}

/**
 * Helper to extract client IP address from NextRequest headers.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}
