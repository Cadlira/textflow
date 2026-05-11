import { Hono } from 'hono';
import { describe, it, expect } from 'vitest';
import { createUser, generateToken, testDb } from './setup';
import { authRoutes } from '../routes/auth';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const app = new Hono();
app.route('/auth', authRoutes);

describe('POST /auth/register', () => {
  it('should register a new user and return 201 with token', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'novo@textflow.app',
        password: '123456',
        name: 'Novo Usuario',
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('novo@textflow.app');
    expect(data.user.name).toBe('Novo Usuario');
    expect(data.user.plan).toBe('free');

    const payload = jwt.verify(data.token, process.env.JWT_SECRET!) as any;
    expect(payload.userId).toBe(data.user.id);

    const dbUser = await testDb.select().from(users).where(eq(users.email, 'novo@textflow.app')).get();
    expect(dbUser).toBeDefined();
    expect(dbUser?.plan).toBe('free');
  });

  it('should return 409 for duplicate email', async () => {
    await createUser('duplicado@textflow.app');

    const res = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'duplicado@textflow.app',
        password: '123456',
      }),
    });

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe('Email already registered');
  });

  it('should return 400 for invalid email (Zod validation)', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalido',
        password: '123456',
      }),
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for short password', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'senha@textflow.app',
        password: '12345',
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('should login with valid credentials and return 200', async () => {
    await createUser('login@textflow.app', '123456');

    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'login@textflow.app',
        password: '123456',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('login@textflow.app');
  });

  it('should return 401 for non-existent email', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nunca@textflow.app',
        password: '123456',
      }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Invalid credentials');
  });

  it('should return 401 for wrong password', async () => {
    await createUser('senhaerrada@textflow.app', '123456');

    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'senhaerrada@textflow.app',
        password: 'errada',
      }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Invalid credentials');
  });
});
