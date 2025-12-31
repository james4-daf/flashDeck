/**
 * Simple in-memory rate limiter
 * For production with multiple instances, consider using Redis (e.g., @upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limits
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Time in seconds until the rate limit resets */
  resetInSeconds: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the rate limit (e.g., userId, IP)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetTime < now) {
    // Create new entry or reset expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      resetInSeconds: config.windowSeconds,
    };
  }

  // Check if limit exceeded
  if (existing.count >= config.limit) {
    const resetInSeconds = Math.ceil((existing.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  // Increment count
  existing.count++;
  rateLimitStore.set(key, existing);

  return {
    success: true,
    remaining: config.limit - existing.count,
    resetInSeconds: Math.ceil((existing.resetTime - now) / 1000),
  };
}

/**
 * Pre-configured rate limiters for different use cases
 */
export const rateLimiters = {
  /** AI generation: 10 requests per minute per user */
  aiGeneration: (userId: string) =>
    checkRateLimit(`ai:${userId}`, { limit: 10, windowSeconds: 60 }),

  /** Document upload: 5 requests per minute per user */
  documentUpload: (userId: string) =>
    checkRateLimit(`doc:${userId}`, { limit: 5, windowSeconds: 60 }),

  /** Stripe checkout: 5 requests per minute per user */
  stripeCheckout: (userId: string) =>
    checkRateLimit(`stripe:${userId}`, { limit: 5, windowSeconds: 60 }),
};

