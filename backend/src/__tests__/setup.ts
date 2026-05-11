import { beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Temp database file path
const testDbPath = path.join(os.tmpdir(), `textflow-test-${Date.now()}.db`);

// Set env BEFORE any module imports
process.env.JWT_SECRET = 'test-secret-key-textflow';
process.env.OPENROUTER_API_KEY = 'sk-test-mock';
process.env.OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
process.env.AI_PROVIDER = 'openrouter';
process.env.DATABASE_URL = testDbPath;

// Create test database and run schema directly
const sqlite = new Database(testDbPath.replace('file:', ''));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Run schema from migration file
beforeAll(() => {
  const migrationFile = path.resolve(__dirname, '../../drizzle/0000_dark_johnny_blaze.sql');
  if (fs.existsSync(migrationFile)) {
    sqlite.exec(fs.readFileSync(migrationFile, 'utf-8'));
  }
});

afterAll(() => {
  sqlite.close();
  try { fs.unlinkSync(testDbPath.replace('file:', '')); } catch {}
});

// Export a test db instance for direct DB checks in tests
export const testDb = drizzle(sqlite, { schema });

// Helper: generate JWT for test user
export function generateToken(userId: string, plan: string = 'free'): string {
  return jwt.sign({ userId, plan }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

// Helper: create test user and return user + token
export async function createUser(
  email: string = 'teste@textflow.app',
  password: string = '123456',
  name?: string
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await testDb
    .insert(schema.users)
    .values({ email, passwordHash, name: name || null })
    .returning();
  const token = generateToken(user.id, user.plan || 'free');
  return { user, token };
}
