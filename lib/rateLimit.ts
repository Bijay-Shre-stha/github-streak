// Rate limiting utility for API routes
// Uses in-memory storage for single-instance deployments
// For production on Vercel, use @vercel/kv instead

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

/**
 * Check if a request should be rate limited
 * @param identifier Unique identifier (e.g., IP address or username)
 * @returns Object with isLimited flag and remaining requests
 */
export function checkRateLimit(identifier: string): {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      isLimited: false,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  const isLimited = entry.count > RATE_LIMIT_MAX_REQUESTS;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);

  return {
    isLimited,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Extract client IP from request headers
 * Works with various proxy setups (Cloudflare, Vercel, nginx, etc.)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list, take the first
    return forwarded.split(",")[0].trim();
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  // Fallback: try to get from CloudFlare
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return "unknown";
}

/**
 * Clean up old entries from rate limit store (call periodically)
 * Prevents memory leaks in long-running processes
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime + 5 * 60 * 1000) {
      // Remove entries that expired more than 5 minutes ago
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Clear all entries from rate limit store (for testing only)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

// Run cleanup every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 10 * 60 * 1000);
}
