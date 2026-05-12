import OpenAI from 'openai';
import type { AiProvider } from '../provider';
import type { AiRequest, AiResponse } from '../types';
import { buildPrompt } from '../prompts';

export class DeepSeekProvider implements AiProvider {
  readonly name = 'deepseek';

  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY!,
      timeout: 60000,
    });
  }

  async process(req: AiRequest, model?: string): Promise<AiResponse> {
    const { systemPrompt, userPrompt } = buildPrompt(req);

    const completion = await this.client.chat.completions.create({
      model: model || 'deepseek-chat',
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
      model: completion.model || model || 'deepseek-chat',
      provider: this.name,
      tokensUsed: {
        input: usage?.prompt_tokens || 0,
        output: usage?.completion_tokens || 0,
        total: usage?.total_tokens || 0,
      },
    };
  }
}
