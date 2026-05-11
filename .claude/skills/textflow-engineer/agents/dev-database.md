# Dev Database — TextFlow

Implementa camada de persistência: schema, migrações, queries.

## Area
- `backend/src/db/` — schema e conexão
- `backend/drizzle/` — migrações geradas

## Tech
| Tech | Usage |
|---|---|
| SQLite | Banco MVP (arquivo único, zero config) |
| Drizzle ORM | Schema definition, queries, migrations |
| `drizzle-kit` | CLI para gerar migrações |
| `better-sqlite3` | Driver SQLite |

## Regra de ouro: SQLITE → POSTGRES

Schema compatível com migração futura:
- Tipos que mapeiam bem: `integer`, `text`, `real`
- Evite features SQLite específicas
- Nomes em **snake_case**
- Toda tabela tem `created_at` e `updated_at`

## Memory

- Siga `references/agent-memory-instructions.md`.
- Use o Memory Briefing quando a tarefa for não trivial.

## File structure

```
backend/
├── drizzle.config.ts      # Drizzle Kit config
├── src/db/
│   ├── schema.ts          # All table definitions
│   ├── index.ts           # Database connection
│   └── seed.ts            # Seed data (dev)
└── drizzle/               # Auto-generated migrations
```

## Code patterns

### Connection
```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') || './data/textflow.db');
sqlite.pragma('journal_mode = WAL');
export const db = drizzle(sqlite, { schema });
```

### Schema
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  plan: text('plan', { enum: ['free', 'pro', 'pro_plus'] }).notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const usageLogs = sqliteTable('usage_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  costCents: integer('cost_cents').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const dailyUsage = sqliteTable('daily_usage', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  requestCount: integer('request_count').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});
```

### Queries
```typescript
import { eq, and, sql } from 'drizzle-orm';
import { db } from './index';
import { users, dailyUsage } from './schema';

export async function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

export async function getTodayUsage(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  return db.select().from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)))
    .get();
}

export async function incrementDailyUsage(userId: string, tokens: number) {
  const today = new Date().toISOString().split('T')[0];
  const existing = await getTodayUsage(userId);
  if (existing) {
    return db.update(dailyUsage)
      .set({ requestCount: existing.requestCount + 1, totalTokens: existing.totalTokens + tokens, updatedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(dailyUsage.id, existing.id));
  }
  return db.insert(dailyUsage).values({ userId, date: today, requestCount: 1, totalTokens: tokens });
}
```

### Drizzle config
```typescript
import type { Config } from 'drizzle-kit';
export default { schema: './src/db/schema.ts', out: './drizzle', dialect: 'sqlite', dbCredentials: { url: './data/textflow.db' } } satisfies Config;
```

## Commands
```bash
npx drizzle-kit generate   # Generate migrations from schema
npx drizzle-kit migrate    # Apply migrations
```

## Don't

- Don't store plaintext passwords, tokens, or API keys
- Don't use raw SQL strings — use Drizzle query builder
- Don't commit `*.db` files
- Don't add columns sem default em tabelas com dados
- Don't usar `AUTOINCREMENT` — use `$defaultFn`
- Don't esquecer `onDelete: 'cascade'` em foreign keys
