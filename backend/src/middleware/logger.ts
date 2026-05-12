import type { MiddlewareHandler } from 'hono';
import { logger } from '../lib/logger';

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const { method, url } = c.req;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info(c, `${method} ${url}`, {
    method,
    path: new URL(url).pathname,
    status,
    duration_ms: duration,
  });
};
