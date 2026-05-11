# Dev Backend — TextFlow

Implementa o servidor Node.js/Hono: rotas REST, middleware, autenticação, Stripe.

## Area
- `backend/src/` — servidor principal
- `backend/src/routes/` — rotas REST
- `backend/src/middleware/` — middleware (auth, rate limit, CORS)
- `backend/src/lib/` — utilitários

## Tech
| Tech | Usage |
|---|---|
| Node.js | 20+ LTS |
| TypeScript | Strict mode, ES2022 |
| Hono | Web framework |
| JWT | `jsonwebtoken` or `jose` |
| bcrypt | `bcryptjs` |
| Stripe | `stripe` SDK |
| Zod | Input validation |
| dotenv | Environment variables |

## Regra de ouro: SEGURANÇA

- NUNCA exponha API keys no código
- Credenciais em `.env` com `.env.example`
- Rotas AI com rate limiting
- JWT tokens com expiração curta (1h)
- CORS configurado explicitamente
- Stripe webhooks verificam assinatura

## Memory

- Siga `references/agent-memory-instructions.md`.
- Use o Memory Briefing quando a tarefa for não trivial.

## File structure

```
backend/src/
├── index.ts              # Entry point
├── routes/
│   ├── auth.ts           # POST /auth/register, /auth/login
│   ├── ai.ts             # POST /ai/rewrite, /ai/summarize, etc.
│   ├── user.ts           # GET /user/me, PATCH /user/me
│   └── stripe.ts         # POST /stripe/webhook, /stripe/checkout
├── middleware/
│   ├── auth.ts           # JWT verification
│   ├── rate-limit.ts     # Rate limiting per user/plan
│   └── error.ts          # Error handler
└── lib/
    ├── db.ts             # Database connection
    ├── stripe.ts         # Stripe client
    └── ai/               # OpenRouter integration
```

## Code patterns

### Entry point
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { aiRoutes } from './routes/ai';
import { userRoutes } from './routes/user';
import { stripeRoutes } from './routes/stripe';

const app = new Hono();

app.use('*', cors({
  origin: ['chrome-extension://*'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route('/auth', authRoutes);
app.route('/ai', aiRoutes);
app.route('/user', userRoutes);
app.route('/stripe', stripeRoutes);
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
```

### Auth middleware
```typescript
import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken';

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});
```

### Rate limiting
```typescript
const usage = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return createMiddleware(async (c, next) => {
    const key = c.get('user')?.userId || c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const record = usage.get(key);
    if (!record || now > record.resetAt) {
      usage.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (record.count >= maxRequests) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }
    record.count++;
    return next();
  });
}
```

## How to implement

### Tools: Read, Edit, Write, Grep, Glob

### Workflow
1. Read existing file
2. Edit surgically
3. TypeScript strict: tipar tudo
4. New files: seguir naming conventions

## Don't

- Don't commit `.env` files
- Don't log secrets, tokens, or passwords
- Don't use `console.log` for production
- Don't trust client input — validar com Zod
- Don't expor stack traces
- Don't usar `require()` — ES modules
- Don't deixar rotas sem rate limit (especialmente `/ai/*`)

## Environment variables (`.env.example`)
```env
PORT=3000
JWT_SECRET=your-secret-here
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DATABASE_URL=file:./data/textflow.db
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_PRO_PLUS_PRICE_ID=price_xxx
```
