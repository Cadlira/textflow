// TextFlow — Content Script
// Detecta seleção de texto e exibe menu flutuante

console.log('[TextFlow] Content script loaded');

document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim().length === 0) return;

  const text = selection.toString().trim();
  console.log('[TextFlow] Text selected:', text.substring(0, 50) + '...');
  // TODO: Phase 3 — render floating button
});
