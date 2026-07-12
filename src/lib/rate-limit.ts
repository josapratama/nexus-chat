interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(
  identifier: string,
  config?: Partial<RateLimitConfig>,
): { success: boolean; remaining: number; resetIn: number } {
  const maxRequests =
    config?.maxRequests ||
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "50");
  const windowMs =
    config?.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000");

  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}
