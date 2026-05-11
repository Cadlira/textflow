# Plano de Implementação — TextFlow

> **Objetivo:** Chrome Extension + Backend que oferece assistente de texto com IA em qualquer site.
> **Stack:** TypeScript, Manifest V3, Node.js/Hono, OpenRouter (DeepSeek V4 Flash), SQLite/Drizzle, Stripe.
> **Modelo:** Freemium — Grátis (5 usos/dia) → Pro (R$19/mês) → Pro+ (R$39/mês).

---

## Fase 0 — Fundação do Projeto

**Objetivo:** Estruturar diretórios, configurar tooling e garantir que tudo compila.

- [x] `0.1` Criar estrutura de diretórios (`extension/` + `backend/`)
- [x] `0.2` Inicializar `backend/package.json` com dependências (Hono, Drizzle, OpenAI SDK, JWT, bcrypt, Stripe, Zod)
- [x] `0.3` Criar `backend/tsconfig.json` (strict, ES2022, ESM)
- [x] `0.4` Criar `backend/.env.example` com todas as variáveis documentadas
- [x] `0.5` Criar `backend/src/index.ts` — servidor Hono mínimo com health check
- [x] `0.6` Criar `extension/manifest.json` (Manifest V3, permissões, content_scripts, service_worker, popup)
- [x] `0.7` Criar `extension/content/content.ts` stub (detecta seleção, exibe botão "em breve")
- [x] `0.8` Criar `extension/background/background.ts` stub (message listener vazio)
- [x] `0.9` Criar `extension/popup/popup.html` + `popup.ts` + `popup.css` stub
- [x] `0.10` Criar `.gitignore` (node_modules, .env, *.db, dist/)
- [x] `0.11` Criar `README.md` — descrição do projeto, stack, setup, estrutura, licença
- [x] `0.12` Testar: `npx tsx src/index.ts` sobe servidor; extensão carrega no Chrome em modo dev

---

## Fase 1 — Backend Core

**Objetivo:** Banco de dados funcional + autenticação JWT completa.

- [x] `1.1` Configurar Drizzle: `drizzle.config.ts` + conexão SQLite (`backend/src/db/index.ts`)
- [x] `1.2` Criar schema inicial: `users` + `usage_logs` + `daily_usage` (`backend/src/db/schema.ts`)
- [x] `1.3` Rodar `npx drizzle-kit generate` → primeira migração
- [x] `1.4` Implementar `POST /auth/register` — validação Zod, hash bcrypt, insert user
- [x] `1.5` Implementar `POST /auth/login` — verifica bcrypt, gera JWT (1h)
- [x] `1.6` Implementar middleware `auth.ts` — verifica Bearer token, injeta `c.set('user', payload)`
- [x] `1.7` Implementar `GET /user/me` — retorna perfil do usuário autenticado
- [x] `1.8` Implementar `PATCH /user/me` — atualiza nome, preferências
- [x] `1.9` Implementar middleware `error.ts` — error handler global (não expõe stack trace)
- [x] `1.10` Implementar middleware `rate-limit.ts` — rate limiting por userId ou IP
- [x] `1.11` Testar: curl register → login → GET /user/me com token

---

## Fase 2 — Integração AI Multi-Provider

**Objetivo:** Proxy de AI funcional com suporte a OpenRouter e DeepSeek direto, prompt engineering e controle de custos.

- [x] `2.1` Criar interface comum de provider: tipo `AiProvider` com método `process()` (`backend/src/lib/ai/provider.ts`)
- [x] `2.2` Criar estrutura `backend/src/lib/ai/providers/`
- [x] `2.3` Criar cliente OpenRouter (`backend/src/lib/ai/providers/openrouter.ts`) — OpenAI SDK → OpenRouter base URL
- [x] `2.4` Criar cliente DeepSeek direto (`backend/src/lib/ai/providers/deepseek.ts`) — OpenAI SDK → DeepSeek base URL
- [x] `2.5` Criar factory `getAiProvider()` — seleciona via `AI_PROVIDER` env (openrouter | deepseek | auto)
- [x] `2.6` Criar `backend/src/lib/ai/prompts.ts` — 5 templates: rewrite, summarize, correct, tone, expand
- [x] `2.7` Criar `backend/src/lib/ai/models.ts` — modelos de ambos providers + fallback cross-provider
- [x] `2.8` Criar `backend/src/lib/ai/actions.ts` — ações disponíveis e seus metadados
- [x] `2.9` Criar `backend/src/lib/ai/types.ts` — AiRequest, AiResponse, Action
- [x] `2.10` Implementar `POST /ai/process` — recebe { text, action, tone? }, usa provider configurado, retorna resultado + tokens
- [x] `2.11` Implementar fallback automático entre providers (se `AI_PROVIDER=auto`: tentar primário → fallback para secundário)
- [x] `2.12` Adicionar rate limiting específico na rota `/ai/*`: free=5/dia, pro=ilimitado
- [x] `2.13` Implementar log de uso: salvar em `usage_logs` + atualizar `daily_usage`
- [x] `2.14` Implementar verificação de quota: free tier bloqueia após 5 usos/dia
- [x] `2.15` Atualizar `.env.example` com `DEEPSEEK_API_KEY` e `AI_PROVIDER`
- [x] `2.16` Testar: curl POST /ai/process com OpenRouter e DeepSeek direto

---

## Fase 4 — Extension: Content Script (Core UX)

**Objetivo:** Detecção de seleção + UI flutuante funcional.

- [ ] `3.1` Implementar `extension/content/content.ts` — listener de `mouseup`, detecta seleção
- [ ] `3.2` Criar `extension/content/styles/content.css` — estilos com prefixo `tf-`
- [ ] `3.3` Implementar botão flutuante: aparece ao lado da seleção, posicionamento via `getBoundingClientRect()`
- [ ] `3.4` Implementar menu dropdown: Reescrever, Resumir, Corrigir, Mudar Tom, Expandir
- [ ] `3.5` Implementar submenu "Mudar Tom": Formal, Casual, Profissional, Amigável
- [ ] `3.6` Implementar `extension/content/api.ts` — envia mensagem para background e aguarda resposta
- [ ] `3.7` Implementar `extension/content/result.ts` — overlay de resultado (substitui texto ou mostra tooltip)
- [ ] `3.8` Implementar indicador de loading (spinner enquanto aguarda AI)
- [ ] `3.9` Implementar tratamento de erro: "Limite diário atingido", "Erro ao processar", etc.
- [ ] `3.10` Implementar cleanup: remove UI ao clicar fora, ao pressionar Escape
- [ ] `3.11` Testar: carregar extensão → selecionar texto em qualquer site → clicar em Reescrever → ver resultado

---

## Fase 5 — Extension: Background + Auth Flow

**Objetivo:** Service worker gerencia autenticação e proxy das chamadas.

- [ ] `4.1` Implementar `extension/background/background.ts` — listeners de mensagem
- [ ] `4.2` Implementar `extension/background/auth.ts` — gerencia JWT em `chrome.storage.local`
- [ ] `4.3` Implementar `extension/background/api.ts` — fetch para backend com token Bearer
- [ ] `4.4` Implementar `extension/background/storage.ts` — wrapper para `chrome.storage.local`
- [ ] `4.5` Implementar handler `PROCESS_TEXT` — chama backend `/ai/process`, retorna resultado
- [ ] `4.6` Implementar handler `LOGIN` — chama backend `/auth/login`, armazena token
- [ ] `4.7` Implementar handler `REGISTER` — chama backend `/auth/register`, armazena token
- [ ] `4.8` Implementar handler `LOGOUT` — limpa token do storage
- [ ] `4.9` Implementar handler `GET_AUTH_STATE` — retorna token, plano, uso do dia
- [ ] `4.10` Implementar `chrome.runtime.onInstalled` — inicializa estado padrão
- [ ] `4.11` Testar: fluxo completo content → background → backend → resultado na tela

---

## Fase 6 — Extension: Popup (UI Completa)

**Objetivo:** Popup com login, dashboard e configurações.

- [ ] `5.1` Estruturar `popup.html` com views: login, register, dashboard, settings, upgrade
- [ ] `5.2` Implementar `components/login.ts` — formulário de login com validação
- [ ] `5.3` Implementar `components/register.ts` — formulário de registro
- [ ] `5.4` Implementar `components/dashboard.ts` — mostra plano atual, usos do dia, botão upgrade
- [ ] `5.5` Implementar `components/settings.ts` — configurações (idioma, ações favoritas)
- [ ] `5.6` Implementar `components/upgrade.ts` — cards de preço: Pro (R$19) e Pro+ (R$39)
- [ ] `5.7` Implementar navegação entre views (login → dashboard → settings → upgrade)
- [ ] `5.8` Implementar `popup.ts` — app principal, inicialização, roteamento de views
- [ ] `5.9` Estilizar popup completo (`popup.css`) — design limpo, profissional
- [ ] `5.10` Testar: abrir popup → login → ver dashboard → navegar entre telas

---

## Fase 7 — Stripe (Pagamentos)

**Objetivo:** Cobrança recorrente funcional via Stripe Checkout.

- [ ] `6.1` Criar `backend/src/lib/stripe.ts` — cliente Stripe com secret key
- [ ] `6.2` Criar produtos/planos no Stripe Dashboard: Pro (R$19/mês) e Pro+ (R$39/mês)
- [ ] `6.3` Implementar `POST /stripe/checkout` — cria Checkout Session, retorna URL
- [ ] `6.4` Implementar `POST /stripe/webhook` — processa `checkout.session.completed`, atualiza plano do user
- [ ] `6.5` Implementar `POST /stripe/webhook` — processa `customer.subscription.deleted`, downgrade para free
- [ ] `6.6` Implementar `POST /stripe/portal` — cria Customer Portal Session para gerenciar assinatura
- [ ] `6.7` Atualizar popup: botão "Assinar Pro" → abre Stripe Checkout
- [ ] `6.8` Atualizar popup: botão "Gerenciar Assinatura" → abre Stripe Customer Portal
- [ ] `6.9` Testar: fluxo completo de assinatura (modo teste Stripe)

---

## Fase 8 — Polimento da Extensão

**Objetivo:** UX refinada, ícones, tratamento de borda.

- [ ] `7.1` Criar ícones da extensão (16px, 48px, 128px)
- [ ] `7.2` Implementar animação suave no botão flutuante (fade in/out)
- [ ] `7.3` Implementar atalho de teclado: `Ctrl+Shift+T` abre menu no texto selecionado
- [ ] `7.4` Implementar "Reescrever com 1 clique" — último tom usado com shift+click
- [ ] `7.5` Implementar indicador de quota no botão flutuante (x/5 free)
- [ ] `7.6` Implementar mensagens de erro amigáveis em português
- [ ] `7.7` Implementar Google OAuth (login sem senha) — opcional, simplifica onboarding
- [ ] `7.8` Testar cross-browser: Chrome, Edge, Brave
- [ ] `7.9` Revisão de acessibilidade: contraste, foco de teclado, screen reader
- [ ] `7.10` Otimizar content script: evitar memory leaks, performance em sites pesados

---

## Fase 9 — Deploy e Distribuição

**Objetivo:** Backend em produção, extensão na Chrome Web Store.

- [ ] `8.1` Deploy do backend no Railway ou Render (free tier inicial)
- [ ] `8.2` Configurar domínio próprio (`textflow.app` ou similar)
- [ ] `8.3` Configurar HTTPS + CORS para o domínio
- [ ] `8.4` Atualizar `extension/background/api.ts` com URL de produção
- [ ] `8.5` Criar landing page simples (HTML/CSS estático ou parte do backend)
- [ ] `8.6` Preparar assets para Chrome Web Store (screenshots, descrição, banner)
- [ ] `8.7` Publicar na Chrome Web Store (taxa única de registro ~R$30)
- [ ] `8.8` Configurar Stripe em modo produção
- [ ] `8.9` Implementar logging/monitoramento básico (erros, uso, custos)
- [ ] `8.10` Criar README.md do projeto

---

## Fase 10 — Pós-Lançamento (Mês 2-3)

**Objetivo:** Iterar com feedback, adicionar features premium.

- [ ] `9.1` Análise de métricas: usuários, conversão, churn, custo AI
- [ ] `9.2` Templates salvos (Pro): usuário salva prompts personalizados
- [ ] `9.3` Histórico de textos processados (Pro)
- [ ] `9.4` Integração WhatsApp Web (Pro+) — detecta campo de texto do WhatsApp Web
- [ ] `9.5` Integração LinkedIn (Pro+) — sugere posts e comentários
- [ ] `9.6` Modelo premium opcional (Pro+): DeepSeek V4 Pro para tarefas complexas
- [ ] `9.7` Modo escuro na UI flutuante
- [ ] `9.8` Exportar histórico como CSV/PDF
- [ ] `9.9` Suporte a Firefox (Manifest V3 compat)

---

## Resumo de Fases

| Fase | Nome | Tarefas | Status |
|:----:|------|:-------:|:------:|
| 0 | Fundação do Projeto | 12 | ✅ Completed |
| 1 | Backend Core | 11 | ✅ Completed |
| 2 | Integração AI Multi-Provider | 16 | ✅ Completed |
| 4 | Extension: Content Script | 11 | ⬜ Pending |
| 5 | Extension: Background + Auth | 11 | ⬜ Pending |
| 6 | Extension: Popup | 10 | ⬜ Pending |
| 7 | Stripe (Pagamentos) | 9 | ⬜ Pending |
| 8 | Polimento da Extensão | 10 | ⬜ Pending |
| 9 | Deploy e Distribuição | 10 | ⬜ Pending |
| 10 | Pós-Lançamento | 9 | ⬜ Pending |
| **Total** | | **109** | |

---

## Regras de Execução

1. **Uma fase por vez.** Não avance para a próxima fase sem concluir todas as tarefas da atual.
2. **Checkbox real.** Cada `[x]` só é marcado quando a tarefa está implementada, verificada e commitada.
3. **Atomicidade.** Cada tarefa deve resultar em pelo menos 1 arquivo modificado/criado.
4. **Teste manual antes de avançar.** Toda fase tem pelo menos 1 tarefa de teste.
5. **Commits por fase.** Ao concluir uma fase, commitar com mensagem `feat(phase-N): descrição`.
6. **Skill textflow-engineer.** Use a skill para orquestrar implementações complexas dentro de cada fase.

---

> **Início:** ___/___/2026
> **Última atualização:** 11/05/2026 — Fase 1 concluída, Fase 2 adicionada (multi-provider)
