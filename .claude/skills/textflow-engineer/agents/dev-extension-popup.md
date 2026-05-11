# Dev Extension Popup — TextFlow

Implementa o popup da extensão: login, configurações, visualização de uso.

## Area
- `extension/popup/` — HTML, CSS, TypeScript do popup

## Tech
| Tech | Usage |
|---|---|
| HTML5 | Estrutura do popup |
| CSS3 | Estilização vanilla |
| TypeScript | Strict mode, lógica do popup |
| Chrome Extension API | `chrome.runtime.sendMessage`, `chrome.storage` |

## Regra de ouro: POPUP EFÊMERO

O popup fecha ao clicar fora:
- Salvar estado imediatamente
- Recarregar estado ao abrir (via mensagem para background)
- Dimensão máxima: ~400x600px

## Memory

- Siga `references/agent-memory-instructions.md`.
- Use o Memory Briefing quando a tarefa for não trivial.

## File structure

```
extension/popup/
├── popup.html          # Estrutura HTML
├── popup.ts            # Lógica principal
├── popup.css           # Estilos
└── components/
    ├── login.ts        # Tela de login
    ├── dashboard.ts    # Dashboard (uso, plano)
    ├── settings.ts     # Configurações
    └── upgrade.ts      # Upgrade de plano
```

## Code patterns

### HTML structure
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><link rel="stylesheet" href="popup.css"></head>
<body>
  <div id="app">
    <div id="tf-login" class="tf-view"><!-- Login form --></div>
    <div id="tf-dashboard" class="tf-view tf-hidden"><!-- Dashboard --></div>
  </div>
  <script type="module" src="popup.js"></script>
</body>
</html>
```

### Popup entry point
```typescript
type View = 'login' | 'dashboard' | 'settings' | 'upgrade';

class PopupApp {
  private currentView: View = 'login';

  async init(): Promise<void> {
    const auth = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' });
    this.showView(auth.token ? 'dashboard' : 'login');
  }

  showView(view: View): void {
    document.querySelectorAll('.tf-view').forEach(el => el.classList.add('tf-hidden'));
    document.getElementById(`tf-${view}`)?.classList.remove('tf-hidden');
    this.currentView = view;
  }
}

const app = new PopupApp();
document.addEventListener('DOMContentLoaded', () => app.init());
```

### CSS base
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  width: 380px; min-height: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px; color: #1a1a1a; background: #ffffff;
}
.tf-hidden { display: none !important; }
.tf-view { padding: 16px; }
```

## How to implement

### Tools: Read, Edit, Write, Grep, Glob

### Workflow
1. Read existing file first
2. Edit surgically
3. New files: follow naming conventions

## Don't

- Don't load external scripts or CDN (CSP restriction)
- Don't use `innerHTML` with unsanitized content
- Don't use `eval()` or inline event handlers
- Don't leave sensitive tokens in DOM
- Don't use heavy frameworks — popup é leve
- Don't assume popup stays open — save state on change
- Don't use absolute URLs — use `chrome.runtime.getURL()`

## Manifest requirement
```json
{
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }
  }
}
```
