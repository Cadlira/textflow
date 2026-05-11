import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';
import { processWithProvider } from '../lib/ai/factory';
import { getAction } from '../lib/ai/actions';
import { db } from '../db';
import { usageLogs, dailyUsage, users } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { JwtPayload } from '../middleware/auth';
import type { AiAction, Tone } from '../lib/ai/types';

const aiRoutes = new Hono();

aiRoutes.use('*', authMiddleware);

const processSchema = z.object({
  text: z.string().min(1).max(10000),
  action: z.enum(['rewrite', 'summarize', 'correct', 'tone', 'expand']),
  tone: z.enum(['formal', 'casual', 'professional', 'friendly']).optional(),
});

async function checkQuota(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const existing = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)))
    .get();

  return (existing?.requestCount || 0) < 5;
}

async function logUsage(
  userId: string,
  action: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const existing = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)))
    .get();

  if (existing) {
    await db
      .update(dailyUsage)
      .set({
        requestCount: existing.requestCount + 1,
        totalTokens: existing.totalTokens + inputTokens + outputTokens,
        updatedAt: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(dailyUsage.id, existing.id));
  } else {
    await db.insert(dailyUsage).values({
      userId,
      date: today,
      requestCount: 1,
      totalTokens: inputTokens + outputTokens,
    });
  }

  await db.insert(usageLogs).values({
    userId,
    action,
    model,
    inputTokens,
    outputTokens,
  });
}

aiRoutes.post('/process', zValidator('json', processSchema), async (c) => {
  const { userId, plan } = c.get('user') as JwtPayload;
  const { text, action, tone } = c.req.valid('json');

  // Plan check
  const actionMeta = getAction(action);
  if (actionMeta?.requiresPremium && plan === 'free') {
    return c.json({ error: 'This action requires a Pro plan' }, 402);
  }

  // Quota check for free users
  if (plan === 'free') {
    const allowed = await checkQuota(userId);
    if (!allowed) {
      return c.json({ error: 'Daily limit reached (5 uses). Upgrade to Pro for unlimited access.' }, 429);
    }
  }

  try {
    const response = await processWithProvider({
      text,
      action: action as AiAction,
      tone: tone as Tone | undefined,
    });

    // Log usage
    await logUsage(
      userId,
      action,
      response.model,
      response.tokensUsed.input,
      response.tokensUsed.output
    );

    return c.json({
      result: response.result,
      provider: response.provider,
      tokensUsed: response.tokensUsed.total,
    });
  } catch (error) {
    console.error('[TextFlow] AI process error:', error);
    return c.json({ error: 'Failed to process text. Please try again.' }, 502);
  }
});

export { aiRoutes };
