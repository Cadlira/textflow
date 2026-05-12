import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { serve } from '@hono/node-server';
import 'dotenv/config';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user';
import { aiRoutes } from './routes/ai';
import { stripeRoutes } from './routes/stripe';
import { landingRoute } from './routes/landing';
import { errorHandler } from './middleware/error';
import { loggerMiddleware } from './middleware/logger';
import { logger } from './lib/logger';

const app = new Hono();

app.use('*', requestId());
app.use('*', loggerMiddleware);
app.use('*', cors({
  origin: (origin) => {
    if (origin && origin.startsWith('chrome-extension://')) return origin;
    const envOrigins = process.env.CORS_ORIGIN;
    if (envOrigins) {
      const allowed = envOrigins.split(',').map(s => s.trim());
      if (origin && allowed.includes(origin)) return origin;
    }
    return '';
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.onError(errorHandler);

app.get('/', landingRoute);

app.route('/auth', authRoutes);
app.route('/user', userRoutes);
app.route('/ai', aiRoutes);
app.route('/stripe', stripeRoutes);

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

const port = parseInt(process.env.PORT || '3000');

logger.info(null, 'TextFlow backend running', { port });

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
});
