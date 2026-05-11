// TextFlow — Service Worker
// Gerencia autenticação e proxy para o backend

const API_BASE = 'http://localhost:3000';

chrome.runtime.onInstalled.addListener(() => {
  console.log('[TextFlow] Extension installed');
  chrome.storage.local.set({
    auth: { token: null, userId: null, plan: 'free', usageToday: 0 },
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[TextFlow] Message:', message.type);

  switch (message.type) {
    case 'PING':
      sendResponse({ pong: true });
      break;

    case 'LOGIN':
      handleLogin(message.payload).then(sendResponse);
      return true;

    case 'REGISTER':
      handleRegister(message.payload).then(sendResponse);
      return true;

    case 'LOGOUT':
      handleLogout().then(sendResponse);
      return true;

    case 'GET_AUTH_STATE':
      getAuthState().then(sendResponse);
      return true;

    case 'PROCESS_TEXT':
      handleProcessText(message.payload).then(sendResponse);
      return true;

    case 'UPDATE_PROFILE':
      handleUpdateProfile(message.payload).then(sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown message type: ' + message.type });
  }
});

// --- Auth ---
async function getAuthState() {
  const result = await chrome.storage.local.get('auth');
  return result.auth || { token: null, userId: null, plan: 'free', usageToday: 0 };
}

async function handleLogin(payload) {
  try {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.token) {
      await chrome.storage.local.set({
        auth: {
          token: data.token,
          userId: data.user.id,
          plan: data.user.plan,
          usageToday: 0,
        },
      });
    }
    return data;
  } catch (err) {
    return { error: 'Connection failed' };
  }
}

async function handleRegister(payload) {
  try {
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.token) {
      await chrome.storage.local.set({
        auth: {
          token: data.token,
          userId: data.user.id,
          plan: data.user.plan,
          usageToday: 0,
        },
      });
    }
    return data;
  } catch (err) {
    return { error: 'Connection failed' };
  }
}

async function handleLogout() {
  await chrome.storage.local.set({
    auth: { token: null, userId: null, plan: 'free', usageToday: 0 },
  });
  return { success: true };
}

// --- AI Processing ---
async function handleProcessText(payload) {
  const auth = await getAuthState();
  if (!auth.token) {
    return { error: 'Faça login primeiro. Clique no ícone da extensão.' };
  }

  try {
    const res = await fetch(API_BASE + '/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + auth.token,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { error: 'Não foi possível conectar ao servidor.' };
  }
}

// --- Profile ---
async function handleUpdateProfile(payload) {
  const auth = await getAuthState();
  if (!auth.token) return { error: 'Not authenticated' };

  try {
    const res = await fetch(API_BASE + '/user/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + auth.token,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.user) {
      auth.name = data.user.name;
      await chrome.storage.local.set({ auth });
    }
    return data;
  } catch (err) {
    return { error: 'Connection failed' };
  }
}
