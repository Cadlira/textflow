# Dev AI/OpenRouter — TextFlow

Implementa integração com OpenRouter: chamadas API, prompt engineering, seleção de modelo, fallback.

## Area
- `backend/src/lib/ai/` — cliente OpenRouter e templates de prompt

## Tech
| Tech | Usage |
|---|---|
| OpenRouter API | `https://openrouter.ai/api/v1/chat/completions` |
| OpenAI SDK | Compatível, apontado para OpenRouter base URL |
| DeepSeek V4 Flash | Modelo padrão ($0.14/$0.28 per 1M tokens) |
| TypeScript | Strict mode |

## Regra de ouro: CUSTO E FALLBACK

- Toda chamada contabiliza tokens (via `usage` na resposta)
- Free tier: N tokens/dia
- Pro: ilimitado mas monitorado
- Fallback automático se modelo primário falhar
- Timeout 10s
- Nunca exponha API key no client

## File structure

```
backend/src/lib/ai/
├── openrouter.ts       # OpenRouter client wrapper
├── prompts.ts          # Prompt templates
├── models.ts           # Model configuration and fallback
├── actions.ts          # Available actions
└── types.ts            # Shared types
```

## Code patterns

### OpenRouter client
```typescript
import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: { 'HTTP-Referer': 'https://textflow.app', 'X-Title': 'TextFlow' },
  timeout: 10000,
});

export async function processText(req: AiRequest): Promise<AiResponse> {
  const { systemPrompt, userPrompt } = buildPrompt(req);
  const model = selectModel();

  try {
    const completion = await openrouter.chat.completions.create({
      model: model.primary,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      max_tokens: req.maxTokens || 1024,
      temperature: 0.7,
    });
    return {
      result: completion.choices[0]?.message?.content || '',
      model: completion.model || model.primary,
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  } catch (error) {
    if (model.fallback) {
      console.warn(`Falling back to ${model.fallback}`);
      return processTextWithModel(req, model.fallback);
    }
    throw error;
  }
}
```

### Model config
```typescript
interface ModelConfig {
  primary: string;
  fallback?: string;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

const models: Record<string, ModelConfig> = {
  default: {
    primary: 'deepseek/deepseek-v4-flash',
    fallback: 'qwen/qwen3.6-35b-a3b',
    maxTokens: 4096,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
  },
  premium: {
    primary: 'deepseek/deepseek-v4-pro',
    maxTokens: 8192,
    costPer1kInput: 0.000435,
    costPer1kOutput: 0.00087,
  },
};

export function selectModel(tier: 'default' | 'premium' = 'default'): ModelConfig {
  return models[tier];
}
```

### Prompt templates
```typescript
const prompts: Record<string, { system: string; user: (text: string, options?: Record<string, string>) => string }> = {
  rewrite: {
    system: 'You are a professional text rewriting assistant. Rewrite the given text to improve clarity, flow, and impact while preserving the original meaning. Always respond in the same language as the input text.',
    user: (text) => `Rewrite the following text:\n\n"${text}"\n\nRewritten version:`,
  },
  summarize: {
    system: 'You are a concise summarizer. Create a brief, clear summary capturing key points. Always respond in the same language as the input text.',
    user: (text) => `Summarize:\n\n"${text}"\n\nSummary:`,
  },
  correct: {
    system: 'You are a grammar and spelling corrector. Fix errors while preserving tone and style. Always respond in the same language as the input.',
    user: (text) => `Correct:\n\n"${text}"\n\nCorrected:`,
  },
  tone_change: {
    system: 'You are a tone adjustment expert. Rewrite to match requested tone. Always respond in the same language as the input.',
    user: (text, options) => `Rewrite in a ${options?.tone || 'professional'} tone:\n\n"${text}"\n\nRewritten:`,
  },
  expand: {
    system: 'You are a content expander. Elaborate adding relevant details while preserving the core message. Always respond in the same language as the input.',
    user: (text) => `Expand with more detail:\n\n"${text}"\n\nExpanded:`,
  },
};

export function buildPrompt(req: AiRequest): { systemPrompt: string; userPrompt: string } {
  const template = prompts[req.action === 'tone' ? 'tone_change' : req.action];
  return {
    systemPrompt: template.system,
    userPrompt: template.user(req.text, { tone: req.tone }),
  };
}
```

### Actions
```typescript
export const actions = [
  { id: 'rewrite', labelPt: 'Reescrever', requiresPremium: false },
  { id: 'summarize', labelPt: 'Resumir', requiresPremium: false },
  { id: 'correct', labelPt: 'Corrigir', requiresPremium: false },
  { id: 'tone', labelPt: 'Mudar Tom', requiresPremium: false },
  { id: 'expand', labelPt: 'Expandir', requiresPremium: false },
];
```

### Token cost
```typescript
export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const costs: Record<string, { input: number; output: number }> = {
    'deepseek/deepseek-v4-flash': { input: 0.00014, output: 0.00028 },
    'deepseek/deepseek-v4-pro': { input: 0.000435, output: 0.00087 },
  };
  const c = costs[modelId] || { input: 0.00014, output: 0.00028 };
  return (inputTokens * c.input + outputTokens * c.output) / 1000;
}
```

## How to implement

### Tools: Read, Edit, Write, Grep, Glob

### Workflow
1. Read existing file
2. Edit surgically
3. Test prompts mentalmente
4. New models: add in `models.ts`

## Don't

- Don't hardcode API keys — use `process.env`
- Don't usar prompts em inglês quando input é português
- Don't exceder max_tokens do modelo
- Don't ignorar rate limits — implementar retry com backoff
- Don't logar texto do usuário (privacidade)
- Don't usar temperatura > 1.0
- Don't expor detalhes de modelos/custos no client

## Portuguese prompt tips

- Sempre instruir o modelo a responder no mesmo idioma
- Escrever prompts nativos em inglês (funciona melhor com modelos multilíngues)
- Instruir explicitamente sobre preservação de idioma
- Testar com textos reais em português
