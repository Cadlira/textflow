import { createMiddleware } from 'hono/factory';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up expired entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
}, 60_000).unref();

export function rateLimit(maxRequests: number, windowMs: number) {
  return createMiddleware(async (c, next) => {
    const user = c.get('user') as { userId?: string } | undefined;
    const key = user?.userId || c.req.header('x-forwarded-for') || 'anonymous';
    const now = Date.now();

    const record = store.get(key);

    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return c.json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      }, 429);
    }

    record.count++;
    return next();
  });
}
