# Agent Memory Instructions — TextFlow

Instruções de uso do `agent-memory` CLI para o projeto TextFlow.

## Setup

O `agent-memory` CLI é a ferramenta padrão para gerenciar memória persistente de aprendizados.

Storage externo padrão: `%USERPROFILE%\.agent-memory\projects\textflow`

Projeto CLI: `textflow`

## Comandos

### Buscar aprendizados (antes do trabalho)
```bash
agent-memory search --project textflow --query "<tema>" --limit 5
```

### Registrar aprendizado (depois do trabalho)
```bash
agent-memory write --project textflow --topic "<tema>" --tags "<tag1,tag2>" --sources "<paths>" --content "<descricao>"
```

### Verificar registro
```bash
agent-memory verify --project textflow --query "<tema>" --expected-topic "<tema>"
```

## Isolamento

- Use sempre `--project textflow`
- Nunca use `--project default`, `--project global` ou `--project memory`
- Se o CLI não oferecer isolamento, marque como `blocked`

## O que armazenar

- Padrão de implementação não óbvio
- Gotchas (CSP, service worker lifecycle, OpenRouter rate limits)
- Achados de QA reutilizáveis
- Decisões de arquitetura que afetam o futuro
- Templates de prompt que funcionaram bem em português

## O que NÃO armazenar

- Secrets, tokens, API keys, credenciais
- Notas rotineiras sem valor
- Código-fonte completo ou diffs
- Build outputs, índices, embeddings

## Fallback

Se `agent-memory` CLI não estiver disponível:
1. Memory Coordinator tenta via bash tool
2. Se falhar, reporta `blocked` com motivo
3. NÃO crie arquivos locais de memória no repositório
4. NÃO carregue `rag-implementation` ou `deep-agents-memory` sem aprovação
