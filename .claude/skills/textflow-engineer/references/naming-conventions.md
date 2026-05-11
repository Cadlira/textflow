# Naming Conventions — TextFlow

## General

- **Language:** TypeScript strict mode (`"strict": true`)
- **Module system:** ES Modules (`import`/`export`, not `require`)
- **No `any`:** Use proper types. If truly unknown, use `unknown`
- **Formatting:** 2 spaces indentation, semicolons required, single quotes

## Files

| Pattern | Example |
|---|---|
| TypeScript files | `kebab-case.ts` → `content.ts`, `rate-limit.ts` |
| CSS files | `kebab-case.css` → `content.css`, `popup.css` |
| HTML files | `kebab-case.html` → `popup.html` |
| Config files | `kebab-case.config.ts` → `drizzle.config.ts` |
| SQL migrations | `NNNN_description.sql` → `0000_initial.sql` |

## Directories

| Pattern | Example |
|---|---|
| General | `kebab-case/` → `extension/`, `background/` |
| Component groups | grouped by domain → `ai/`, `db/`, `stripe/` |

## Variables & Functions

| Pattern | Example |
|---|---|
| Variables | `camelCase` → `authState`, `userCount` |
| Functions | `camelCase` → `getUserByEmail()`, `processText()` |
| Boolean variables | `is`/`has`/`should` prefix → `isActive`, `hasToken` |
| Constants | `UPPER_SNAKE_CASE` → `API_BASE_URL`, `MAX_FREE_USES` |

## Types & Interfaces

| Pattern | Example |
|---|---|
| Interfaces | `PascalCase` → `AiRequest`, `AuthState` |
| Type aliases | `PascalCase` → `Action`, `Plan`, `ModelConfig` |
| String unions | `'value1' | 'value2'` (not TypeScript enums) |
| DTOs | `PascalCase` → `LoginInput`, `AiResponseData` |

## Database (Drizzle)

| Pattern | Example |
|---|---|
| Tables | `snake_case` plural → `users`, `usage_logs` |
| Columns | `snake_case` → `created_at`, `user_id` |
| Schema exports | `camelCase` plural → `export const users` |
| Foreign keys | `{table_singular}_id` → `user_id` |

## Backend Routes

| Pattern | Example |
|---|---|
| REST endpoints | `/resource/{param}` → `/ai/rewrite`, `/user/me` |
| Route files | `kebab-case.ts` → `auth.ts`, `ai.ts` |
| Middleware | `camelCase` → `authMiddleware`, `rateLimit()` |

## Chrome Extension

| Pattern | Example |
|---|---|
| Message types | `UPPER_SNAKE_CASE` → `PROCESS_TEXT`, `LOGIN` |
| Storage keys | `camelCase` → `auth`, `settings`, `usageCache` |
| CSS classes | `tf-` prefix, kebab-case → `tf-floating-btn`, `tf-hidden` |
| Icons | `icon{size}.png` → `icon16.png`, `icon48.png` |

## Environment Variables

| Pattern | Example |
|---|---|
| Keys | `UPPER_SNAKE_CASE` → `JWT_SECRET`, `OPENROUTER_API_KEY` |
| `.env.example` | Document all vars, no real values |

## Error messages

- API errors: return JSON `{ error: string }` with HTTP status
- Client-side: user-friendly message in Portuguese
- Logs: English, structured, never expose secrets

## Examples

```typescript
// Function with types
async function processText(req: AiRequest): Promise<AiResponse> {
  const { text, action } = req;
  const prompt = buildPrompt(req);
  return await callOpenRouter(prompt);
}

// Interface
interface AiRequest {
  text: string;
  action: 'rewrite' | 'summarize' | 'correct' | 'tone' | 'expand';
  tone?: 'formal' | 'casual' | 'professional' | 'friendly';
  maxTokens?: number;
}
```
