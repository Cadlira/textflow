---
name: textflow-engineer
description: >-
  DISPARE esta skill para QUALQUER alteração de código no projeto TextFlow:
  bugfix, feature ou mudança de comportamento. Orquestra Memory Coordinator, PO,
  Arquiteto, Tech Lead, Devs e QA em Chrome Extension (Manifest V3) + Node.js/Hono
  backend + OpenRouter AI. NÃO dispare para perguntas, análises sem modificação
  ou prompts de outras skills/agentes.
---

# TextFlow Engineer — Squad de Orquestração

## Quando usar esta skill

**DISPARE** esta skill quando o prompt do usuário envolver:
- Correção de bug
- Nova funcionalidade (feature)
- Alteração de comportamento existente (melhoria)
- Qualquer modificação de código no projeto TextFlow

**NÃO dispare** para:
- Perguntas sobre funcionamento do código
- Análises sem modificação
- Explicações de arquitetura
- Consultas de documentação
- Prompts de outras skills, agentes internos ou ferramentas automáticas
- Prompts vagos sem contexto suficiente (pergunte ao usuário antes de disparar)

**RE-ENTRÂNCIA:** Dispare **NOVAMENTE a cada nova solicitação**, mesmo na mesma sessão. Execução anterior NÃO desabilita a skill para futuras modificações.

## Sobre o projeto TextFlow

TextFlow é uma Chrome Extension (Manifest V3) + backend Node.js/Hono que oferece assistente de texto com IA via OpenRouter. O usuário seleciona texto em qualquer site, um botão flutuante aparece, e a IA reescreve, resume, corrige ou muda o tom do texto.

**Stack:** TypeScript, Chrome Extension Manifest V3, Node.js, Hono, OpenRouter (DeepSeek V4 Flash), SQLite → PostgreSQL, Stripe, Railway/Render.

## Fluxo de orquestração

```
USUÁRIO → MEMORY COORDINATOR (briefing) → PO → ARQUITETO → TECH LEAD → DEV1 ∥ DEV2 ∥ DEV3 → QA → MEMORY COORDINATOR (persistência/verificação)
                                                                    ↑                  │
                                                                    └─── fallback ─────┘
```

Você (orquestrador) gerencia o fluxo. Fases sequenciais; devs em paralelo quando possível.

## Aprendizado global

Use `learning-rag-memory` em modo curto como governança de memória.

Agente responsável pela operação de memória: `agents/memory-coordinator.md`.

Memória persistente deve ficar fora do repositório, em namespace físico por projeto: `%USERPROFILE%\.agent-memory\projects\textflow`. Use sempre o projeto `textflow` no `agent-memory` CLI.

O `agent-memory` não deve gravar aprendizados do TextFlow em arquivo/base genérica compartilhada com outros projetos. Se o CLI não garantir isolamento real por `--project textflow` ou por diretório equivalente, marque memória como `blocked` e não persista aprendizados até corrigir a configuração.

Antes da implementação:
- Peça briefing curto de aprendizados anteriores ao `memory-coordinator`
- Quando `memory-coordinator` não estiver disponível e houver terminal, execute `agent-memory search --project textflow --query "<tema>"`
- Não crie arquivos de memória, índices, vetores, sessões ou bases de conhecimento neste repositório
- Não carregue `rag-implementation` automaticamente
- Não carregue `deep-agents-memory` automaticamente; use apenas se a demanda for implementar memória/RAG/Deep Agent ou se o usuário aprovar

Após a implementação:
- Envie aprendizados reutilizáveis ao `memory-coordinator` para registro curto fora do repositório
- Quando `memory-coordinator` não estiver disponível e houver aprendizado reutilizável, execute `agent-memory write ...` e depois `agent-memory verify ...`
- Se não houver aprendizado reutilizável, registre `skipped - trivial/no reusable learning`
- Nunca crie `.ai/memory` nem qualquer pasta de memória persistente no projeto
- Nunca use projeto genérico (`default`, `global`, `memory`) para aprendizados do TextFlow

## Gestão de progresso com TodoWrite

Use TodoWrite para trackear progresso. Ao iniciar, crie 8 itens:
1. "Fase 0 - Memory Coordinator (briefing)" - pending
2. "Fase 1 - Product Owner (levantamento de requisitos)" - pending
3. "Fase 2 - Arquiteto (análise técnica)" - pending
4. "Fase 3 - Tech Lead (decomposição em tarefas)" - pending
5. "Fase 4 - Devs (implementação código)" - pending
6. "Fase 5 - QA (revisão e testes)" - pending
7. "Fase 6 - Loop de correção (se necessário)" - pending
8. "Fase Final - Memory Coordinator (persistência/verificação)" - pending

Atualize status: **in_progress** ao começar, **completed** ao terminar, **cancelled** se fase 6 desnecessária.

**Regra de evidência:** NUNCA marque uma fase como **completed** apenas porque o orquestrador analisou o código diretamente. Cada fase só pode ir para **completed** depois que sua saída esperada existir e for nomeada explicitamente no contexto da execução.

Evidências mínimas obrigatórias:
- Fase 0: `Memory Briefing` com status `found`, `empty` ou `blocked`
- Fase 1: documento de requisitos do PO, validado contra o prompt do usuário
- Fase 2: documento de arquitetura com arquivos afetados, abordagem e riscos
- Fase 3: plano de execução do Tech Lead com tarefas, responsáveis e dependências
- Fase 4: relatório dos devs informando arquivos alterados e validação objetiva
- Fase 5: relatório de QA comparando implementação contra requisitos, arquitetura e plano
- Fase Final: relatório de persistência/verificação de memória ou motivo explícito de skip/block

Se uma fase não puder ser executada formalmente, mantenha-a como **pending** ou **cancelled** com motivo explícito e peça confirmação do usuário antes de prosseguir. Não use **completed** para fases simuladas, inferidas ou substituídas por análise direta.

---

## Gates anti-pulo de fase

Antes de iniciar a Fase 4 ou editar qualquer arquivo de código-fonte, execute este checklist em voz alta para si mesmo e só avance se todos forem verdadeiros:
- [ ] Fase 0 está completed com `Memory Briefing` real ou blocked/cancelled aprovado pelo usuário
- [ ] Fase 1 está completed com documento de requisitos real do PO
- [ ] Fase 2 está completed com documento de arquitetura real do Arquiteto
- [ ] Fase 3 está completed com plano de execução real do Tech Lead
- [ ] O TodoWrite mostra exatamente uma fase `in_progress`: Fase 4

Se qualquer item falhar: PARE, não edite arquivos e execute a fase ausente. Análise direta do orquestrador, leitura de arquivos, grep, diff ou raciocínio próprio não substituem nenhum desses artefatos.

Antes de iniciar a Fase 5, confirme:
- [ ] Todos os devs da Fase 4 terminaram
- [ ] Existe lista objetiva dos arquivos modificados
- [ ] Existem conteúdos atuais dos arquivos modificados para passar ao QA

Antes do resumo final, confirme:
- [ ] Fase 5 está completed com relatório de QA real
- [ ] Fase 6 foi completed quando houve problemas ou cancelled quando desnecessária
- [ ] Fase Final tem relatório de memória ou status explícito `skipped`, `blocked` ou `recorded`
- [ ] O resumo final inclui uma tabela curta com fase, status e evidência

Modelo obrigatório de auditoria final:

| Fase | Status | Evidência |
|---|---|---|
| 0 - Memory | completed/blocked/cancelled | [nome do briefing/status] |
| 1 - PO | completed | [documento de requisitos] |
| 2 - Arquiteto | completed | [documento de arquitetura] |
| 3 - Tech Lead | completed | [plano de execução] |
| 4 - Devs | completed | [relatório/lista de arquivos] |
| 5 - QA | completed | [relatório de QA] |
| 6 - Correção | completed/cancelled | [motivo] |
| Final - Memory | completed/blocked | [relatório/status] |

---

## Tratamento de falhas do Task tool

Se qualquer Task tool falhar (timeout, erro, crash):
1. Registre qual agente falhou e a mensagem de erro
2. Re-tente UMA vez com mesmos parâmetros
3. Se falhar novamente: reporte ao usuário — `"[Agente X] falhou após 2 tentativas. Erro: [mensagem]. Deseja prosseguir?"`
4. Não avance de fase com agente pendente

---

## Fase 0 — Memory Coordinator (briefing)

**Objetivo:** Recuperar aprendizados anteriores antes de demandas relevantes, sem implementar código e sem criar memória local no repositório.

**O Memory Coordinator NÃO implementa código.** Função exclusiva: briefing, persistência externa e verificação via `agent-memory`.

**C
