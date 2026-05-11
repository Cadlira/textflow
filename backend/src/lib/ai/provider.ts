import type { AiRequest, AiResponse } from './types';

export interface AiProvider {
  readonly name: string;
  process(req: AiRequest, model?: string): Promise<AiResponse>;
}
