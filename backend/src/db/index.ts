import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbPath = (process.env.DATABASE_URL || './data/textflow.db').replace('file:', '');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite, { schema });

const migrationsFolder = path.resolve(process.cwd(), 'drizzle');
if (fs.existsSync(migrationsFolder) && !process.env.VITEST) {
  migrate(db, { migrationsFolder });
}

export { db };
