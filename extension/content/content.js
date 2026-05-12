// TextFlow — Content Script
// Detecta seleção de texto e exibe menu flutuante com ações AI

(function () {
  'use strict';

  const ACTIONS = [
    { id: 'rewrite', label: 'Reescrever' },
    { id: 'summarize', label: 'Resumir' },
    { id: 'correct', label: 'Corrigir' },
    { id: 'tone', label: 'Mudar Tom' },
    { id: 'expand', label: 'Expandir' },
  ];

  const TONES = [
    { id: 'formal', label: 'Formal' },
    { id: 'casual', label: 'Casual' },
    { id: 'professional', label: 'Profissional' },
    { id: 'friendly', label: 'Amigável' },
  ];

  let activeText = '';
  let floatingContainer = null;

  // --- Selection Detection ---
  let isOurClick = false;

  document.addEventListener('pointerup', (e) => {
    // Ignore clicks on our own UI
    if (e.target.closest('.tf-floating-btn') || e.target.closest('.tf-menu') || e.target.closest('.tf-result') || e.target.closest('.tf-error')) {
      isOurClick = true;
      setTimeout(() => { isOurClick = false; }, 100);
      return;
    }

    setTimeout(() => {
      if (isOurClick) return;

      const selection = window.getSelection();
      if (!selection || selection.toString().trim().length === 0) return;
      if (selection.rangeCount === 0) return;

      const text = selection.toString().trim();
      if (text.length < 2) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      activeText = text;
      showFloatingButton(rect);
    }, 20);
  });

  // Hide on outside click
  document.addEventListener('pointerdown', (e) => {
    if (floatingContainer && !e.target.closest('.tf-container') && !e.target.closest('.tf-result')) {
      setTimeout(removeUI, 100);
    }
  });

  // Hide on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') removeUI();
  });

  // --- Floating Button ---
  function showFloatingButton(rect) {
    removeUI();

    floatingContainer = document.createElement('div');
    floatingContainer.className = 'tf-container';
    floatingContainer.style.cssText = 'position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;';

    const btn = document.createElement('button');
    btn.className = 'tf-floating-btn';

    // Load quota display
    chrome.storage.local.get('auth', (result) => {
      const auth = result.auth || {};
      if (auth.plan === 'free') {
        const remaining = Math.max(0, 5 - (auth.usageToday || 0));
        btn.textContent = remaining > 0 ? '✨ TextFlow (' + remaining + '/5)' : '⛔ TextFlow (0/5)';
        if (remaining === 0) btn.title = 'Limite diário atingido. Assine o Pro para uso ilimitado.';
      }
    });
    if (!btn.textContent) btn.textContent = '✨ TextFlow';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.shiftKey) {
        chrome.storage.local.get('lastTone', (result) => {
          if (result.lastTone) {
            processText('tone', result.lastTone);
          } else {
            showMenu(btn);
          }
        });
      } else {
        showMenu(btn);
      }
    });

    // Inline styles for maximum compatibility (overrides host page CSS)
    btn.style.cssText =
      'all:initial;position:fixed;z-index:2147483647;' +
      'background:#1a1a2e;color:#e0e0e0;border:none;border-radius:8px;' +
      'padding:8px 14px;font-size:13px;cursor:pointer;white-space:nowrap;' +
      'box-shadow:0 4px 16px rgba(0,0,0,0.35);' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.3;' +
      'transition:opacity 0.15s;opacity:0;';

    floatingContainer.appendChild(btn);
    document.body.appendChild(floatingContainer);

    // Position: rect values are viewport-relative (from getBoundingClientRect)
    // Use these directly since button is position:fixed (viewport-relative too)
    requestAnimationFrame(() => {
      const btnW = btn.offsetWidth || 140;
      const btnH = btn.offsetHeight || 34;

      let top = rect.bottom + 8;
      let left = rect.left;

      // If button extends below viewport (with room for menu), flip above
      if (top + btnH + 260 > window.innerHeight) {
        top = rect.top - btnH - 8;
      }

      // Clamp to viewport
      top = Math.max(4, Math.min(top, window.innerHeight - btnH - 4));
      left = Math.max(4, Math.min(left, window.innerWidth - btnW - 4));

      btn.style.top = top + 'px';
      btn.style.left = left + 'px';
      btn.style.opacity = '1';
    });
  }

  // --- Action Menu ---
  function showMenu(anchorBtn) {
    const existing = floatingContainer.querySelector('.tf-menu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.className = 'tf-menu';
    menu.style.cssText =
      'all:initial;position:fixed;z-index:2147483646;' +
      'background:#fff;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,0.2);' +
      'padding:6px;min-width:160px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

    ACTIONS.forEach((action) => {
      const item = document.createElement('button');
      item.style.cssText =
        'all:initial;display:block;width:100%;padding:10px 14px;' +
        'font-size:13px;color:#1a1a2e;cursor:pointer;border-radius:6px;' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
        'box-sizing:border-box;text-align:left;';
      item.textContent = action.label;
      item.addEventListener('mouseenter', () => { item.style.background = '#f0f0f5'; });
      item.addEventListener('mouseleave', () => { item.style.background = ''; });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.remove();
        if (action.id === 'tone') {
          showToneMenu(anchorBtn);
        } else {
          processText(action.id);
        }
      });
      menu.appendChild(item);
    });

    floatingContainer.appendChild(menu);

    requestAnimationFrame(() => {
      const btnRect = anchorBtn.getBoundingClientRect();
      let menuTop = btnRect.bottom + 4;
      if (menuTop + 260 > window.innerHeight) {
        menuTop = btnRect.top - menu.offsetHeight - 4;
      }
      const menuLeft = Math.max(4, Math.min(btnRect.left, window.innerWidth - menu.offsetWidth - 4));
      menu.style.top = menuTop + 'px';
      menu.style.left = menuLeft + 'px';
    });
  }

  // --- Tone Submenu ---
  function showToneMenu(anchorBtn) {
    const menu = document.createElement('div');
    menu.className = 'tf-menu';
    menu.style.cssText =
      'all:initial;position:fixed;z-index:2147483646;' +
      'background:#fff;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,0.2);' +
      'padding:6px;min-width:160px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

    TONES.forEach((tone) => {
      const item = document.createElement('button');
      item.style.cssText =
        'all:initial;display:block;width:100%;padding:10px 14px;' +
        'font-size:13px;color:#1a1a2e;cursor:pointer;border-radius:6px;' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
        'box-sizing:border-box;text-align:left;';
      item.textContent = tone.label;
      item.addEventListener('mouseenter', () => { item.style.background = '#f0f0f5'; });
      item.addEventListener('mouseleave', () => { item.style.background = ''; });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.remove();
        processText('tone', tone.id);
      });
      menu.appendChild(item);
    });

    floatingContainer.appendChild(menu);

    requestAnimationFrame(() => {
      const btnRect = anchorBtn.getBoundingClientRect();
      let menuTop = btnRect.bottom + 4;
      if (menuTop + 200 > window.innerHeight) {
        menuTop = btnRect.top - menu.offsetHeight - 4;
      }
      const menuLeft = Math.max(4, Math.min(btnRect.left, window.innerWidth - menu.offsetWidth - 4));
      menu.style.top = menuTop + 'px';
      menu.style.left = menuLeft + 'px';
    });
  }

  // --- Process Text ---
  async function processText(action, tone) {
    showLoading();

    // Store last tone for shift+click
    if (action === 'tone' && tone) {
      chrome.storage.local.set({ lastTone: tone });
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'PROCESS_TEXT',
        payload: { text: activeText, action, tone },
      });

      removeUI();

      if (response.error) {
        showError(response.error);
      } else {
        showResult(response.result);
      }
    } catch (err) {
      removeUI();
      showError('Erro ao processar. Verifique se o servidor está rodando.');
    }
  }

  // --- Loading ---
  function showLoading() {
    removeUI();

    floatingContainer = document.createElement('div');
    floatingContainer.className = 'tf-container';

    const spinner = document.createElement('div');
    spinner.className = 'tf-loading';
    spinner.textContent = '⏳ Processando...';

    floatingContainer.appendChild(spinner);
    document.body.appendChild(floatingContainer);

    // Center on screen
    spinner.style.top = '50%';
    spinner.style.left = '50%';
    spinner.style.transform = 'translate(-50%, -50%)';
    spinner.style.position = 'fixed';
  }

  // --- Result ---
  function showResult(text) {
    floatingContainer = document.createElement('div');
    floatingContainer.className = 'tf-container';

    const result = document.createElement('div');
    result.className = 'tf-result';

    const header = document.createElement('div');
    header.className = 'tf-result-header';
    header.innerHTML = '<span>Resultado</span>';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'tf-result-copy';
    copyBtn.textContent = '📋 Copiar';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text);
      copyBtn.textContent = '✓ Copiado!';
      setTimeout(() => { copyBtn.textContent = '📋 Copiar'; }, 2000);
    });
    header.appendChild(copyBtn);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'tf-result-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', removeUI);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'tf-result-body';
    body.textContent = text;

    result.appendChild(header);
    result.appendChild(body);
    floatingContainer.appendChild(result);
    document.body.appendChild(floatingContainer);

    // Position center-right
    result.style.top = '50%';
    result.style.left = '50%';
    result.style.transform = 'translate(-50%, -50%)';
    result.style.position = 'fixed';
  }

  // --- Error ---
  function showError(message) {
    floatingContainer = document.createElement('div');
    floatingContainer.className = 'tf-container';

    const toast = document.createElement('div');
    toast.className = 'tf-error';
    toast.textContent = message;

    floatingContainer.appendChild(toast);
    document.body.appendChild(floatingContainer);

    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.position = 'fixed';

    setTimeout(removeUI, 4000);
  }

  // --- Cleanup ---
  function removeUI() {
    if (floatingContainer) {
      floatingContainer.remove();
      floatingContainer = null;
    }
  }

  // --- Keyboard Shortcut Listener (from background) ---
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'OPEN_MENU') {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length >= 2) {
        activeText = selection.toString().trim();
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        showFloatingButton(rect);
        setTimeout(() => {
          const btn = floatingContainer?.querySelector('.tf-floating-btn');
          if (btn) showMenu(btn);
        }, 200);
      } else {
        showError('Selecione um texto para usar o TextFlow');
      }
    }
  });
})();
