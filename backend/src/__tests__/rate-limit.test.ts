import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { rateLimit } from '../middleware/rate-limit';
import { Hono } from 'hono';

describe('rateLimit middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should allow first request', async () => {
    app.use('/test', rateLimit(5, 60000));
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test', {
      method: 'GET',
      headers: { 'x-forwarded-for': '127.0.0.1' },
    });

    expect(res.status).toBe(200);
  });

  it('should allow exactly maxRequests requests', async () => {
    app.use('/test', rateLimit(5, 60000));
    app.get('/test', (c) => c.json({ ok: true }));

    for (let i = 0; i < 5; i++) {
      const res = await app.request('/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });
      expect(res.status).toBe(200);
    }
  });

  it('should block request after maxRequests exceeded', async () => {
    app.use('/test', rateLimit(3, 60000));
    app.get('/test', (c) => c.json({ ok: true }));

    // 3 successful
    for (let i = 0; i < 3; i++) {
      await app.request('/test', {
        method: 'GET',
        headers: { 'x-forwarded-for': '10.0.0.1' },
      });
    }

    // 4th blocked
    const res = await app.request('/test', {
      method: 'GET',
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe('Rate limit exceeded');
    expect(typeof data.retryAfter).toBe('number');
  });

  it('should use anonymous key when no userId or IP', async () => {
    app.use('/test', rateLimit(2, 60000));
    app.get('/test', (c) => c.json({ ok: true }));

    await app.request('/test', { method: 'GET' });
    await app.request('/test', { method: 'GET' });

    const res = await app.request('/test', { method: 'GET' });
    expect(res.status).toBe(429);
  });

  it('should separate limits per key', async () => {
    app.use('/test', rateLimit(2, 60000));
    app.get('/test', (c) => c.json({ ok: true }));

    // IP 1: 2 requests
    await app.request('/test', { method: 'GET', headers: { 'x-forwarded-for': '1.1.1.1' } });
    await app.request('/test', { method: 'GET', headers: { 'x-forwarded-for': '1.1.1.1' } });

    // IP 1: blocked
    let res = await app.request('/test', { method: 'GET', headers: { 'x-forwarded-for': '1.1.1.1' } });
    expect(res.status).toBe(429);

    // IP 2: still allowed
    res = await app.request('/test', { method: 'GET', headers: { 'x-forwarded-for': '2.2.2.2' } });
    expect(res.status).toBe(200);
  });
});
