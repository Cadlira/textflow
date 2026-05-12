import OpenAI from 'openai';
import type { AiProvider } from '../provider';
import type { AiRequest, AiResponse } from '../types';
import { buildPrompt } from '../prompts';

export class OpenRouterProvider implements AiProvider {
  readonly name = 'openrouter';

  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY!,
      defaultHeaders: {
        'HTTP-Referer': 'https://textflow.online',
        'X-Title': 'TextFlow',
      },
      timeout: 60000,
    });
  }

  async process(req: AiRequest, model?: string): Promise<AiResponse> {
    const { systemPrompt, userPrompt } = buildPrompt(req);

    const completion = await this.client.chat.completions.create({
      model: model || 'deepseek/deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: req.maxTokens || 1024,
      temperature: 0.7,
    });

    const usage = completion.usage;

    return {
      result: completion.choices[0]?.message?.content || '',
      model: completion.model || model || 'deepseek/deepseek-v4-flash',
      provider: this.name,
      tokensUsed: {
        input: usage?.prompt_tokens || 0,
        output: usage?.completion_tokens || 0,
        total: usage?.total_tokens || 0,
      },
    };
  }
}
