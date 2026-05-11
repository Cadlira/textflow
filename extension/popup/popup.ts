// TextFlow — Popup Script
// Gerencia a UI do popup da extensão

console.log('[TextFlow] Popup loaded');

document.addEventListener('DOMContentLoaded', async () => {
  // Check connection with service worker
  try {
    const response = await chrome.runtime.sendMessage({ type: 'PING' });
    console.log('[TextFlow] Service worker:', response);
  } catch (err) {
    console.error('[TextFlow] Service worker unreachable:', err);
  }
});
