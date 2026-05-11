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
  document.addEventListener('mouseup', (e) => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim().length === 0) return;
      if (selection.rangeCount === 0) return;

      const text = selection.toString().trim();
      if (text.length < 2) return;

      // Ignore if clicking inside our own UI
      if (e.target.closest('.tf-container')) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      activeText = text;
      showFloatingButton(rect);
    }, 10);
  });

  // --- Floating Button ---
  function showFloatingButton(rect) {
    removeUI();

    floatingContainer = document.createElement('div');
    floatingContainer.className = 'tf-container';

    const btn = document.createElement('button');
    btn.className = 'tf-floating-btn';
    btn.textContent = '✨ TextFlow';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showMenu(btn);
    });

    floatingContainer.appendChild(btn);
    document.body.appendChild(floatingContainer);

    // Position near selection
    const top = rect.bottom + window.scrollY + 6;
    const left = Math.min(rect.left + window.scrollX, window.innerWidth - 160);

    btn.style.top = top + 'px';
    btn.style.left = left + 'px';
  }

  // --- Action Menu ---
  function showMenu(anchorBtn) {
    // Remove existing menu
    const existing = floatingContainer.querySelector('.tf-menu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.className = 'tf-menu';

    ACTIONS.forEach((action) => {
      const item = document.createElement('button');
      item.className = 'tf-menu-item';
      item.textContent = action.label;
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

    // Position below button
    const btnRect = anchorBtn.getBoundingClientRect();
    menu.style.top = (btnRect.bottom + 4) + 'px';
    menu.style.left = btnRect.left + 'px';
  }

  // --- Tone Submenu ---
  function showToneMenu(anchorBtn) {
    const menu = document.createElement('div');
    menu.className = 'tf-menu';

    TONES.forEach((tone) => {
      const item = document.createElement('button');
      item.className = 'tf-menu-item';
      item.textContent = tone.label;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.remove();
        processText('tone', tone.id);
      });
      menu.appendChild(item);
    });

    floatingContainer.appendChild(menu);

    const btnRect = anchorBtn.getBoundingClientRect();
    menu.style.top = (btnRect.bottom + 4) + 'px';
    menu.style.left = btnRect.left + 'px';
  }

  // --- Process Text ---
  async function processText(action, tone) {
    showLoading();

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

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tf-container')) {
      removeUI();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeUI();
    }
  });
})();
