# Dev Extension Content — TextFlow

Implementa o content script da extensão: detecção de seleção de texto e UI flutuante.

## Area
- `extension/content/` — content script principal
- `extension/content/styles/` — CSS da UI flutuante

## Tech
| Tech | Usage |
|---|---|
| TypeScript | Strict mode, ES2022 target |
| Chrome Extension API | `chrome.runtime.sendMessage`, `chrome.storage` |
| DOM API | `window.getSelection()`, `Range`, element injection |
| CSS | Vanilla, scoped, prefixo `tf-` |

## Regra de ouro: ISOLAMENTO

O content script roda em isolated world:
- Todo CSS usa prefixo `tf-` para evitar conflito
- Nunca modifique elementos da página host
- Nunca use `eval()` ou inline scripts
- Event listeners não interferem nos da página

## Memory

- Siga `references/agent-memory-instructions.md`.
- Use o Memory Briefing quando a tarefa for não trivial.
- Reporte aprendizados reutilizáveis ao Tech Lead.

## File structure

```
extension/content/
├── content.ts          # Entry point: selection detection, UI injection
├── menu.ts             # Floating menu component
├── result.ts           # Result display (inline overlay)
├── api.ts              # Communication with background → backend
├── types.ts            # Shared types
└── styles/
    └── content.css     # Scoped styles (tf- prefix)
```

## Code patterns

### Selection detection
```typescript
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    const text = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showFloatingButton(rect, text);
  }
});
```

### Communication
```typescript
chrome.runtime.sendMessage({ type: 'PROCESS_TEXT', payload }, (response) => {
  if (response.error) showError(response.error);
  else showResult(response.result);
});
```

### Floating UI injection
```typescript
function showFloatingButton(rect: DOMRect, text: string): void {
  removeExistingButton();
  const btn = document.createElement('div');
  btn.className = 'tf-floating-btn';
  btn.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 5}px;
    left: ${rect.left}px;
    z-index: 2147483647;
  `;
  document.body.appendChild(btn);
}
```

## How to implement

### Tools: Read, Edit, Write, Grep, Glob

### Workflow
1. Read existing file first
2. Locate exact change
3. Edit surgically: exact oldString → newString
4. CSS: always use `tf-` prefix
5. New files: follow naming conventions

## Don't

- Don't use jQuery or DOM frameworks — vanilla TS only
- Don't use inline styles (CSS classes with `tf-` prefix)
- Don't assume `document.body` exists
- Don't use `innerHTML` with unsanitized content
- Don't pollute global namespace — use IIFE or module pattern
- Don't expose API keys in content script
- Don't use `eval()` or `new Function()` (CSP restriction)
- Don't load external scripts (no CDN in Manifest V3)
