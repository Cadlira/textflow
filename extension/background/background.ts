// TextFlow — Service Worker
// Gerencia autenticação e comunicação entre content script e backend

console.log('[TextFlow] Service worker started');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[TextFlow] Extension installed');
  chrome.storage.local.set({ auth: { token: null, userId: null, plan: 'free', usageToday: 0 } });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[TextFlow] Message received:', message.type);

  // TODO: Phase 4 — implement message handlers
  switch (message.type) {
    case 'PING':
      sendResponse({ pong: true });
      break;
    default:
      sendResponse({ error: 'Unknown message type' });
  }

  return true; // Keep channel open for async response
});
