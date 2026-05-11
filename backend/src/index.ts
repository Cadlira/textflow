import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import 'dotenv/config';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user';
import { errorHandler } from './middleware/error';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: ['chrome-extension://*'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.onError(errorHandler);

app.route('/auth', authRoutes);
app.route('/user', userRoutes);

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

const port = parseInt(process.env.PORT || '3000');

console.log(`TextFlow backend running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
