# TextFlow

Assistente de texto com IA para qualquer site. Selecione o texto, clique no botão flutuante e reescreva, resuma, corrija ou ajuste o tom com um clique.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Extensão | Chrome Manifest V3, TypeScript |
| Backend | Node.js, Hono, TypeScript |
| AI | OpenRouter (DeepSeek V4 Flash) |
| Banco | SQLite + Drizzle ORM |
| Pagamentos | Stripe |

## Estrutura

```
textflow/
├── extension/           # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── content/         # Content script (UI flutuante nos sites)
│   ├── background/      # Service worker (auth, comunicação)
│   ├── popup/           # Popup (login, dashboard)
│   └── icons/           # Ícones da extensão
├── backend/             # Servidor Node.js/Hono
│   ├── src/
│   │   ├── index.ts     # Entry point
│   │   ├── routes/      # Rotas REST
│   │   ├── middleware/   # Auth, rate limit, error handler
│   │   ├── db/          # Schema e conexão Drizzle
│   │   └── lib/         # Stripe, OpenRouter, utilitários
│   └── package.json
├── .claude/             # Skills (textflow-engineer)
└── PLAN.md              # Plano de implementação
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # Edite com suas chaves
npm install
npm run dev            # http://localhost:3000
```

### Extensão

1. Abra `chrome://extensions`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `textflow/extension`

## Planos

| Plano | Preço | Limite |
|-------|:-----:|--------|
| Grátis | R$ 0 | 5 usos/dia |
| Pro | R$ 19/mês | Ilimitado |
| Pro+ | R$ 39/mês | Ilimitado + WhatsApp + LinkedIn |

## Licença

MIT
