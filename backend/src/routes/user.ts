import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { JwtPayload } from '../middleware/auth';

const userRoutes = new Hono();

userRoutes.use('*', authMiddleware);

userRoutes.get('/me', async (c) => {
  const { userId } = c.get('user') as JwtPayload;

  const user = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      plan: users.plan,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user });
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
});

userRoutes.patch('/me', zValidator('json', updateSchema), async (c) => {
  const { userId } = c.get('user') as JwtPayload;
  const { name } = c.req.valid('json');

  if (!name) {
    return c.json({ error: 'Nothing to update' }, 400);
  }

  const [updated] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      plan: users.plan,
    });

  return c.json({ user: updated });
});

export { userRoutes };
