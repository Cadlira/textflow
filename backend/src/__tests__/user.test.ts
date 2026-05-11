import { Hono } from 'hono';
import { describe, it, expect, beforeEach } from 'vitest';
import { createUser, generateToken, testDb } from './setup';
import { userRoutes } from '../routes/user';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();
app.route('/user', userRoutes);

describe('GET /user/me', () => {
  let token: string;
  let userId: string;
  let userEmail: string;

  beforeEach(async () => {
    userEmail = `perfil-${Date.now()}@textflow.app`;
    const { user, token: t } = await createUser(userEmail);
    userId = user.id;
    token = t;
  });

  it('should return 200 with user profile when authenticated', async () => {
    const res = await app.request('/user/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.id).toBe(userId);
    expect(data.user.email).toBe(userEmail);
    expect(data.user.plan).toBe('free');
    expect(data.user).not.toHaveProperty('passwordHash');
  });

  it('should return 401 without auth header', async () => {
    const res = await app.request('/user/me', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await app.request('/user/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer token-invalido' },
    });

    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent user', async () => {
    const ghostToken = generateToken('id-inexistente-12345');
    const res = await app.request('/user/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${ghostToken}` },
    });

    expect(res.status).toBe(404);
  });
});

describe('PATCH /user/me', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const { user, token: t } = await createUser(`update-${Date.now()}@textflow.app`);
    userId = user.id;
    token = t;
  });

  it('should update name and return 200', async () => {
    const res = await app.request('/user/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Nome Atualizado' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.name).toBe('Nome Atualizado');

    const dbUser = await testDb.select().from(users).where(eq(users.id, userId)).get();
    expect(dbUser?.name).toBe('Nome Atualizado');
  });

  it('should return 400 when body is empty', async () => {
    const res = await app.request('/user/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it('should return 401 without auth', async () => {
    const res = await app.request('/user/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X' }),
    });

    expect(res.status).toBe(401);
  });
});
