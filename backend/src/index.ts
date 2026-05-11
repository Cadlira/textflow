import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import 'dotenv/config';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: ['chrome-extension://*'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

const port = parseInt(process.env.PORT || '3000');

console.log(`TextFlow backend running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
