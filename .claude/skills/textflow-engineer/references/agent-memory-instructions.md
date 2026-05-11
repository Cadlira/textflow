# Agent Memory Instructions — TextFlow

Instruções para gerenciar memória persistente de aprendizados usando o sistema file-based.

## Estrutura

```
%USERPROFILE%\.agent-memory\projects\textflow\
├── learnings/       # Aprendizados reutilizáveis
├── decisions/       # Decisões de arquitetura
├── patterns/        # Padrões de implementação
└── sessions/        # Sessões de trabalho em andamento
```

## Operações

### Buscar aprendizados (antes do trabalho)

Use Grep e Glob no diretório de memória:

```bash
# Busca por tags e palavras-chave nos arquivos de aprendizado
grep -rl "<tema>" "%USERPROFILE%\.agent-memory\projects\textflow\"

# Ou listar aprendizados recentes
ls -t "%USERPROFILE%\.agent-memory\projects\textflow\learnings\"
```

Status de retorno:
- `found`: existem arquivos com conteúdo relevante
- `empty`: diretório existe mas sem correspondência
- `blocked`: diretório inacessível ou permissão negada

### Registrar aprendizado (depois do trabalho)

Criar arquivo markdown com frontmatter YAML no diretório `learnings/`:

```markdown
---
date: YYYY-MM-DD
topic: kebab-case-topic
tags: [tag1, tag2]
sources: [path/to/file1, path/to/file2]
---

# Título

## O que foi feito
Breve descrição.

## O que funcionou
Resultado positivo.

## O que evitar
Gotchas, erros, falsas premissas.

## Levar adiante
Regra, padrão ou decisão para o futuro.
```

Nome do arquivo: `YYYY-MM-DD-<topic>.md`

### Verificar registro

Após escrever, confirmar que o arquivo é recuperável:

```bash
# Verificar que o arquivo existe e tem conteúdo
wc -l "%USERPROFILE%\.agent-memory\projects\textflow\learnings\YYYY-MM-DD-<topic>.md"

# Verificar que é encontrável por busca
grep -l "<tema>" "%USERPROFILE%\.agent-memory\projects\textflow\learnings\"
```

## Isolamento

- Cada projeto tem seu diretório isolado em `projects\<nome-do-projeto>\`
- Nunca misture aprendizados de projetos diferentes
- Se o diretório do projeto não existir, crie-o antes de usar

## O que armazenar

- Padrão de implementação não óbvio
- Gotchas (CSP, service worker lifecycle, OpenRouter rate limits)
- Achados de QA reutilizáveis
- Decisões de arquitetura que afetam o futuro
- Templates de prompt que funcionaram bem

## O que NÃO armazenar

- Secrets, tokens, API keys, credenciais
- Notas rotineiras sem valor
- Código-fonte completo ou diffs
- Build outputs, índices, embeddings

## Fallback

Se o diretório de memória estiver inacessível:
1. Memory Coordinator reporta `blocked` com motivo
2. NÃO crie arquivos de memória dentro do repositório do projeto
3. NÃO carregue `rag-implementation` ou `deep-agents-memory` sem aprovação
