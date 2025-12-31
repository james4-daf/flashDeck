/**
 * Production-safe logging utilities
 * Only logs in development mode to prevent sensitive data exposure in production logs
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Log debug information (only in development)
 */
export function logDebug(message: string, data?: unknown): void {
  if (isDev) {
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}

/**
 * Log info (only in development, or always if forceLog is true)
 */
export function logInfo(message: string, data?: unknown, forceLog = false): void {
  if (isDev || forceLog) {
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}

/**
 * Log warnings (always logged, but with sanitized data in production)
 */
export function logWarn(message: string, data?: unknown): void {
  if (isDev) {
    if (data !== undefined) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  } else {
    // In production, log without potentially sensitive data
    console.warn(message);
  }
}

/**
 * Log errors (always logged for monitoring, but sanitized in production)
 */
export function logError(message: string, error?: unknown): void {
  if (isDev) {
    console.error(message, error);
  } else {
    // In production, only log the message and error type/message, not full stack
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${message}: ${errorMessage}`);
  }
}

/**
 * Sanitize an object for logging (removes sensitive fields)
 */
export function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'apiKey',
    'api_key',
    'authorization',
    'stripeCustomerId',
    'stripeSubscriptionId',
    'stripePriceId',
  ];

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLog(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

