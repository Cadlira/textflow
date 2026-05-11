import type { AiRequest, Tone } from './types';

interface PromptTemplate {
  system: string;
  user: (text: string, options?: { tone?: Tone }) => string;
}

const templates: Record<string, PromptTemplate> = {
  rewrite: {
    system:
      'You are a professional text rewriting assistant. Rewrite the given text to improve clarity, flow, and impact while preserving the original meaning. Always respond in the same language as the input text. Return only the rewritten text, no explanations.',
    user: (text) => `Rewrite the following text:\n\n"${text}"\n\nRewritten version:`,
  },
  summarize: {
    system:
      'You are a concise summarizer. Create a brief, clear summary capturing the key points. Always respond in the same language as the input text. Return only the summary, no explanations.',
    user: (text) => `Summarize the following text:\n\n"${text}"\n\nSummary:`,
  },
  correct: {
    system:
      'You are a grammar and spelling corrector. Fix any grammar, spelling, or punctuation errors while preserving the original tone and style. Always respond in the same language as the input text. Return only the corrected text, no explanations.',
    user: (text) => `Correct the following text:\n\n"${text}"\n\nCorrected version:`,
  },
  tone: {
    system:
      'You are a tone adjustment expert. Rewrite the text to match the requested tone while preserving the original meaning. Always respond in the same language as the input text. Return only the rewritten text, no explanations.',
    user: (text, options) =>
      `Rewrite the following text in a ${options?.tone || 'professional'} tone:\n\n"${text}"\n\nRewritten version:`,
  },
  expand: {
    system:
      'You are a content expander. Elaborate on the given text, adding relevant details, examples, or explanations while preserving the core message. Always respond in the same language as the input text. Return only the expanded text, no explanations.',
    user: (text) => `Expand on the following text with more detail:\n\n"${text}"\n\nExpanded version:`,
  },
};

export function buildPrompt(req: AiRequest): { systemPrompt: string; userPrompt: string } {
  const key = req.action === 'tone' ? 'tone' : req.action;
  const template = templates[key];
  return {
    systemPrompt: template.system,
    userPrompt: template.user(req.text, { tone: req.tone }),
  };
}
