# Dev Extension Background — TextFlow

Implementa o service worker da extensão: auth, comunicação, estado.

## Area
- `extension/background/` — service worker

## Tech
| Tech | Usage |
|---|---|
| TypeScript | Strict mode |
| Chrome Extension API | `chrome.runtime.onMessage`, `chrome.storage.local`, `chrome.alarms` |
| Service Worker | Manifest V3 — não persistente |

## Regra de ouro: SERVICE WORKER LIFECYCLE

O service worker dorme após ~30s de inatividade:
- Não dependa de estado global em memória (use `chrome.storage.local`)
- Reconstrua estado ao acordar
- Use `chrome.alarms` para tarefas periódicas
- Não use `setTimeout`/`setInterval` de longa duração
- Todo listener deve ser registrado no top-level

## Memory

- Siga `references/agent-memory-instructions.md`.
- Use o Memory Briefing quando a tarefa for não trivial.
- Reporte aprendizados reutilizáveis ao Tech Lead.

## File structure

```
extension/background/
├── background.ts       # Entry point: message listeners, initialization
├── auth.ts             # Auth token management (JWT in chrome.storage)
├── api.ts              # HTTP client for backend API
├── types.ts            # Shared message types
└── storage.ts          # chrome.storage.local wrapper
```

## Code patterns

### Message listener (top-level)
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});
```

### Auth state
```typescript
interface AuthState {
  token: string | null;
  userId: string | null;
  plan: 'free' | 'pro' | 'pro_plus';
  usageToday: number;
}

async function getAuthState(): Promise<AuthState> {
  const result = await chrome.storage.local.get('auth');
  return result.auth || { token: null, userId: null, plan: 'free', usageToday: 0 };
}
```

### API client
```typescript
const API_BASE = 'https://api.textflow.app';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = await getAuthState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}
```

### Message handler
```typescript
async function handleMessage(msg: { type: string; payload?: unknown }, sender: chrome.runtime.MessageSender): Promise<unknown> {
  switch (msg.type) {
    case 'PROCESS_TEXT': return processText(msg.payload);
    case 'LOGIN': return login(msg.payload);
    case 'GET_AUTH_STATE': return getAuthState();
    case 'LOGOUT': return logout();
    default: throw new Error(`Unknown message type: ${msg.type}`);
  }
}
```

## How to implement

### Tools: Read, Edit, Write, Grep, Glob

### Workflow
1. Read existing file first
2. Locate exact change
3. Edit surgically
4. Preserve Manifest V3 patterns
5. New files: follow naming conventions

## Don't

- Don't use `localStorage` (not available in SW) — use `chrome.storage.local`
- Don't use `window` or `document`
- Don't use long-running timers
- Don't keep sensitive data in memory — persist to storage
- Don't expose backend URL or API keys in extension code
- Don't assume service worker is always running
- Don't use WebSocket in service worker

## Manifest requirement
```json
{
  "background": {
    "service_worker": "background/background.js",
    "type": "module"
  }
}
```
