# Project Overview — TextFlow

TextFlow é uma Chrome Extension + backend que oferece assistente de texto com IA via OpenRouter.

## Produto

- Assistente de texto universal — funciona em qualquer site
- Seleciona texto → botão flutuante → menu: Reescrever | Resumir | Corrigir | Mudar Tom | Expandir
- Planos: Grátis (5 usos/dia) | Pro (R$19/mês ilimitado) | Pro+ (R$39/mês + WhatsApp/LinkedIn futuro)
- Stack: TypeScript, Chrome Manifest V3, Node.js/Hono, OpenRouter, SQLite/Drizzle, Stripe

## Architecture

```
BROWSER (Extension) ─── HTTPS ─── BACKEND (Node.js/Hono) ─── OpenRouter API
     │                                  │
     ├─ Content Script                ├─ Auth (JWT)
     ├─ Service Worker                ├─ AI Proxy (rate-limited)
     ├─ Popup UI                      ├─ User/Plan Management
     └─ chrome.storage                ├─ Stripe (payments)
                                      └─ SQLite (Drizzle ORM)
```

## Tech decisions

| Decision | Rationale |
|---|---|
| Hono (not Express) | Mais leve, melhor TypeScript, Web standard APIs |
| SQLite (MVP) | Zero config, arquivo único, fácil backup |
| Drizzle (not Prisma) | Mais leve, SQL-like, melhor para edge/serverless |
| OpenAI SDK → OpenRouter | Compatível, troca de modelo com 1 linha |
| Stripe | Melhor DX para SaaS, checkout hosted, suporte BR |
| No framework CSS | Extensão é leve, vanilla CSS com prefixo `tf-` |

## Main directory structure

```
textflow/
├── extension/
│   ├── manifest.json
│   ├── content/
│   │   ├── content.ts             # Selection detection, UI injection
│   │   ├── menu.ts                # Floating menu component
│   │   ├── result.ts              # Result display
│   │   ├── api.ts                 # Communication with background
│   │   ├── types.ts               # Shared types
│   │   └── styles/content.css     # Scoped styles (tf- prefix)
│   ├── background/
│   │   ├── background.ts          # Message listeners, initialization
│   │   ├── auth.ts                # Token management (chrome.storage)
│   │   ├── api.ts                 # HTTP client for backend
│   │   └── storage.ts             # chrome.storage wrapper
│   ├── popup/
│   │   ├── popup.html             # Popup structure
│   │   ├── popup.ts               # Popup logic
│   │   ├── popup.css              # Popup styles
│   │   └── components/
│   │       ├── login.ts           # Login screen
│   │       ├── dashboard.ts       # User dashboard
│   │       ├── settings.ts        # Settings
│   │       └── upgrade.ts         # Plan upgrade
│   └── icons/                     # Extension icons
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── drizzle.config.ts
    ├── src/
    │   ├── index.ts               # Entry point, Hono app setup
    │   ├── routes/
    │   │   ├── auth.ts            # POST /auth/register, /auth/login
    │   │   ├── ai.ts              # POST /ai/rewrite, /ai/summarize
    │   │   ├── user.ts            # GET /user/me, PATCH /user/me
    │   │   └── stripe.ts          # POST /stripe/webhook, /stripe/checkout
    │   ├── middleware/
    │   │   ├── auth.ts            # JWT verification
    │   │   ├── rate-limit.ts      # Rate limiting
    │   │   └── error.ts           # Error handler
    │   ├── db/
    │   │   ├── schema.ts          # Drizzle schema
    │   │   ├── index.ts           # Database connection
    │   │   └── seed.ts            # Seed data
    │   └── lib/
    │       ├── stripe.ts          # Stripe client
    │       └── ai/
    │           ├── openrouter.ts  # OpenRouter client
    │           ├── prompts.ts     # Prompt templates
    │           ├── models.ts      # Model configuration
    │           ├── actions.ts     # Available actions
    │           └── types.ts       # AI types
    └── drizzle/                   # Auto-generated migrations
```

## Data flow — Process Text

```
1. User selects text on a website
2. content.ts detects selection → shows floating button
3. User clicks button → selects action (e.g., "Reescrever")
4. content.ts → chrome.runtime.sendMessage({ type: 'PROCESS_TEXT', payload })
5. background.ts receives → checks auth → calls backend /ai/rewrite
6. Backend: auth middleware → rate limit check → OpenRouter API → log usage → return result
7. background.ts receives response → sends back to content.ts
8. content.ts displays result inline
```
