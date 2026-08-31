import { NextResponse } from 'next/server';

/**
 * KNOWN ARCHITECTURAL LIMITATIONS:
 * 1. IN-MEMORY STORE:
 *    Rate limit records are stored in an in-memory Map.
 *    - Records reset whenever the service restarts or redeploys on Render.
 *    - State is not shared across horizontal replicas if scaling to multiple instances.
 *    - RECOMMENDATION: For multi-instance horizontal scaling, migrate to Redis (@upstash/ratelimit).
 *
 * 2. PROXY HEADER ASSUMPTION (X-Forwarded-For):
 *    Render appends the real client IP to the end of the X-Forwarded-For header chain (client, proxy1, proxy2, realIp).
 *    - We parse the last non-empty IP in the chain to prevent client-side header spoofing.
 *    - NOTE: If adding a CDN or reverse proxy (e.g. Cloudflare) in front of Render in the future,
 *      verify the proxy header configuration to ensure the end-user IP is properly resolved.
 */

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
 * Helper to extract client IP address from NextRequest headers safely.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map((ip) => ip.trim()).filter(Boolean);
    if (ips.length > 0) {
      // Return the rightmost IP appended by Render proxy edge
      return ips[ips.length - 1];
    }
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}
