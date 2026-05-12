import { Hono } from 'hono';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUser, generateToken, testDb } from './setup';
import { dailyUsage } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// Mock OpenAI SDK — must use regular function (not arrow) to support `new` constructor
vi.mock('openai', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [{ message: { content: '[RESULTADO MOCK] Texto processado com sucesso.' } }],
    model: 'deepseek/deepseek-v4-flash',
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  });

  function MockOpenAI(this: any) {
    this.chat = { completions: { create: mockCreate } };
  }

  return { default: MockOpenAI };
});

import { aiRoutes } from '../routes/ai';

const app = new Hono();
app.route('/ai', aiRoutes);

describe('POST /ai/process', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const { user, token: t } = await createUser(`ai-test-${Date.now()}@textflow.app`);
    userId = user.id;
    token = t;
  });

  it('should process correct action and return 200', async () => {
    const res = await app.request('/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: 'Isso é um texto com alguns erros de ortografia.',
        action: 'correct',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe('string');
    expect(data.result.length).toBeGreaterThan(0);
    expect(data.provider).toBeDefined();
    expect(typeof data.tokensUsed).toBe('number');
  });

  it('should process summarize action and return 200', async () => {
    const res = await app.request('/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: 'Este é um texto longo que precisa ser resumido. O resumo deve ser conciso e direto ao ponto.',
        action: 'summarize',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result).toBeDefined();
  });

  it('should log usage to daily_usage table', async () => {
    await app.request('/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: 'teste', action: 'correct' }),
    });

    const today = new Date().toISOString().split('T')[0];
    const usage = await testDb
      .select()
      .from(dailyUsage)
      .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)))
      .get();

    expect(usage).toBeDefined();
    expect(usage!.requestCount).toBeGreaterThanOrEqual(1);
  });

  it('should return 401 without auth header', async () => {
    const res = await app.request('/ai/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'teste', action: 'correct' }),
    });

    expect(res.status).toBe(401);
  });

  it('should return 400 for empty text (Zod)', async () => {
    const res = await app.request('/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: '', action: 'correct' }),
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid action', async () => {
    const res = await app.request('/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: 'teste', action: 'invalid_action' }),
    });

    expect(res.status).toBe(400);
  });

  it('should return 429 when free user exceeds daily quota (5)', async () => {
    const today = new Date().toISOString().split('T')[0];
    await testDb.insert(dailyUsage).values({
      userId,
      date: today,
      requestCount: 5,
      totalTokens: 500,
    });

    const res = await app.request('/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: 'teste', action: 'correct' }),
    });

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain('Daily limit reached');
  });

  it('should allow pro users to exceed quota', async () => {
    const proToken = generateToken(userId, 'pro');

    const today = new Date().toISOString().split('T')[0];
    await testDb.insert(dailyUsage).values({
      userId,
      date: today,
      requestCount: 5,
      totalTokens: 500,
    });

    const res = await app.request('/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${proToken}`,
      },
      body: JSON.stringify({ text: 'teste', action: 'correct' }),
    });

    expect(res.status).toBe(200);
  });
});
