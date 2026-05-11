export type AiAction = 'rewrite' | 'summarize' | 'correct' | 'tone' | 'expand';

export type Tone = 'formal' | 'casual' | 'professional' | 'friendly';

export interface AiRequest {
  text: string;
  action: AiAction;
  tone?: Tone;
  maxTokens?: number;
}

export interface AiResponse {
  result: string;
  model: string;
  provider: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
}

export interface ActionMeta {
  id: AiAction;
  labelPt: string;
  requiresPremium: boolean;
}
