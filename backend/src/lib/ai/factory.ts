import type { AiProvider } from './provider';
import type { AiRequest, AiResponse } from './types';
import { getModel, getDefaultModel } from './models';
import { OpenRouterProvider } from './providers/openrouter';
import { DeepSeekProvider } from './providers/deepseek';

type ProviderMode = 'openrouter' | 'deepseek' | 'auto';

let openrouterInstance: OpenRouterProvider | null = null;
let deepseekInstance: DeepSeekProvider | null = null;

function getOpenRouter(): OpenRouterProvider {
  if (!openrouterInstance) {
    openrouterInstance = new OpenRouterProvider();
  }
  return openrouterInstance;
}

function getDeepSeek(): DeepSeekProvider {
  if (!deepseekInstance) {
    deepseekInstance = new DeepSeekProvider();
  }
  return deepseekInstance;
}

function resolveMode(): ProviderMode {
  const mode = (process.env.AI_PROVIDER || 'openrouter') as ProviderMode;
  if (!['openrouter', 'deepseek', 'auto'].includes(mode)) {
    console.warn(`Invalid AI_PROVIDER "${mode}", falling back to openrouter`);
    return 'openrouter';
  }
  return mode;
}

function getPrimaryProvider(mode: ProviderMode): { provider: AiProvider; modelId: string } {
  const model = getDefaultModel(mode === 'deepseek' ? 'deepseek' : 'openrouter');
  return {
    provider: mode === 'deepseek' ? getDeepSeek() : getOpenRouter(),
    modelId: model.id,
  };
}

export async function processWithProvider(req: AiRequest): Promise<AiResponse> {
  const mode = resolveMode();
  const { provider, modelId } = getPrimaryProvider(mode);

  try {
    return await provider.process(req, modelId);
  } catch (error) {
    const model = getModel(modelId);
    if (!model?.fallbackId) throw error;

    const fallbackModel = getModel(model.fallbackId);
    if (!fallbackModel) throw error;

    console.warn(
      `[TextFlow] Provider ${model.provider} failed for ${modelId}, falling back to ${fallbackModel.id} (${fallbackModel.provider})`
    );

    const fallbackProvider =
      fallbackModel.provider === 'deepseek' ? getDeepSeek() : getOpenRouter();

    return fallbackProvider.process(req, fallbackModel.id);
  }
}
