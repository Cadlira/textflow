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
| Pro | R$ 9,90/mês | Ilimitado |
| Pro+ | R$ 19,90/mês | Ilimitado + WhatsApp + LinkedIn |

## Deploy

### Docker (local)

```bash
docker build -t textflow-backend .
docker run -p 3000:3000 --env-file backend/.env textflow-backend
```

### Railway

1. Conecte o repositório no [Railway](https://railway.app)
2. Configure o root directory como `backend/`
3. Adicione as variáveis de ambiente do `backend/.env.example`
4. Configure um volume para persistir o banco SQLite em `/app/data`

### Render

1. Conecte o repositório no [Render](https://render.com)
2. O `render.yaml` na raiz configura automaticamente o Blueprint
3. Crie o grupo de secrets `textflow-secrets` com JWT_SECRET, API keys e chaves Stripe

### Chrome Web Store

1. Gere os assets: `node scripts/generate-store-assets.js` (substitua por screenshots reais)
2. Acesse o [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Submeta a pasta `extension/` compactada em `.zip`
4. Preencha descrição, screenshots e política de privacidade

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta do servidor (default: 3000) |
| `CORS_ORIGIN` | Origens permitidas (separadas por vírgula) |
| `NODE_ENV` | Ambiente (`development` ou `production`) |
| `JWT_SECRET` | Chave secreta para tokens JWT |
| `AI_PROVIDER` | Provedor de AI (`openrouter`, `deepseek`, `auto`) |
| `OPENROUTER_API_KEY` | API key do OpenRouter |
| `DEEPSEEK_API_KEY` | API key do DeepSeek |
| `DATABASE_URL` | URL do banco SQLite |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe |
| `STRIPE_PRO_PRICE_ID` | Price ID do plano Pro |
| `STRIPE_PRO_PLUS_PRICE_ID` | Price ID do plano Pro+ |

## Licença

MIT
