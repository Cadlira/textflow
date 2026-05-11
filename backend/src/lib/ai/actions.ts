import type { ActionMeta } from './types';

export const actions: ActionMeta[] = [
  { id: 'rewrite', labelPt: 'Reescrever', requiresPremium: false },
  { id: 'summarize', labelPt: 'Resumir', requiresPremium: false },
  { id: 'correct', labelPt: 'Corrigir', requiresPremium: false },
  { id: 'tone', labelPt: 'Mudar Tom', requiresPremium: false },
  { id: 'expand', labelPt: 'Expandir', requiresPremium: false },
];

export function getAction(id: string): ActionMeta | undefined {
  return actions.find((a) => a.id === id);
}
