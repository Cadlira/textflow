# Tech Stack — TextFlow

Complete technology stack.

## Frontend (Chrome Extension)

| Tech | Version | Usage |
|---|---|---|
| Chrome Extension API | Manifest V3 | Extension framework |
| TypeScript | 5.x (strict) | All extension code |
| CSS | CSS3 | Styling (vanilla, no framework) |
| Chrome Storage API | V3 | Local state (`chrome.storage.local`) |
| Chrome Runtime API | V3 | Message passing |

## Backend (Node.js)

| Tech | Version | Usage |
|---|---|---|
| Node.js | 20+ LTS | Runtime |
| TypeScript | 5.x (strict) | All backend code |
| Hono | 4.x | HTTP framework |
| @hono/zod-validator | Latest | Input validation middleware |

## AI Integration

| Tech | Usage |
|---|---|
| OpenAI SDK | Compatível, apontado para OpenRouter base URL |
| OpenRouter API | Gateway para múltiplos modelos AI |
| DeepSeek V4 Flash | Modelo padrão ($0.14/$0.28 per 1M tokens) |
| DeepSeek V4 Pro | Modelo premium ($0.435/$0.87 per 1M tokens) |

## Database

| Tech | Version | Usage |
|---|---|---|
| SQLite | 3.x | Banco MVP |
| Drizzle ORM | Latest | Schema, queries, migrations |
| drizzle-kit | Latest | Migration generation |
| better-sqlite3 | Latest | SQLite driver |

## Authentication

| Tech | Usage |
|---|---|
| JWT | `jsonwebtoken` or `jose` |
| bcrypt | `bcryptjs` |
| Bearer tokens | `Authorization: Bearer <token>` |

## Payments (Stripe)

| Tech | Usage |
|---|---|
| Stripe SDK | `stripe` npm package |
| Stripe Checkout | Hosted checkout page |
| Stripe Webhooks | Payment event handling |

## Validation

| Tech | Usage |
|---|---|
| Zod | Schema validation for all API inputs |

## Development

| Tech | Usage |
|---|---|
| tsx | TypeScript execution (dev server) |
| drizzle-kit | Database migrations |
| dotenv | Environment variables |
| Chrome DevTools | Extension debugging |

## Deployment

| Service | Usage |
|---|---|
| Railway / Render | Backend hosting (free tier inicial) |
| Chrome Web Store | Extension distribution |
| Domínio próprio | `textflow.app` (futuro) |

## Key dependencies (`package.json`)

```json
{
  "dependencies": {
    "hono": "^4.x",
    "@hono/zod-validator": "^0.x",
    "drizzle-orm": "^0.x",
    "better-sqlite3": "^11.x",
    "openai": "^4.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "stripe": "^16.x",
    "zod": "^3.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/better-sqlite3": "^7.x",
    "@types/jsonwebtoken": "^9.x",
    "@types/bcryptjs": "^2.x",
    "drizzle-kit": "^0.x",
    "tsx": "^4.x"
  }
}
```
