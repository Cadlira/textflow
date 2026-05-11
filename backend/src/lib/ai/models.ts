export interface ModelConfig {
  id: string;
  provider: 'openrouter' | 'deepseek';
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  fallbackId?: string;
}

const models: Record<string, ModelConfig> = {
  // DeepSeek via OpenRouter
  'deepseek/deepseek-v4-flash': {
    id: 'deepseek/deepseek-v4-flash',
    provider: 'openrouter',
    maxTokens: 4096,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
    fallbackId: 'deepseek-chat', // fallback to DeepSeek direct
  },
  'deepseek/deepseek-v4-pro': {
    id: 'deepseek/deepseek-v4-pro',
    provider: 'openrouter',
    maxTokens: 8192,
    costPer1kInput: 0.000435,
    costPer1kOutput: 0.00087,
    fallbackId: 'deepseek-chat',
  },

  // DeepSeek direct API
  'deepseek-chat': {
    id: 'deepseek-chat',
    provider: 'deepseek',
    maxTokens: 4096,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
    fallbackId: 'deepseek/deepseek-v4-flash', // fallback to OpenRouter
  },

  // Qwen via OpenRouter (backup)
  'qwen/qwen3.6-35b-a3b': {
    id: 'qwen/qwen3.6-35b-a3b',
    provider: 'openrouter',
    maxTokens: 4096,
    costPer1kInput: 0.00012,
    costPer1kOutput: 0.00024,
  },
};

export function getModel(id: string): ModelConfig | undefined {
  return models[id];
}

export function getDefaultModel(provider: 'openrouter' | 'deepseek'): ModelConfig {
  return provider === 'openrouter' ? models['deepseek/deepseek-v4-flash'] : models['deepseek-chat'];
}

export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = models[modelId];
  if (!model) return 0;
  return (inputTokens * model.costPer1kInput + outputTokens * model.costPer1kOutput) / 1000;
}
