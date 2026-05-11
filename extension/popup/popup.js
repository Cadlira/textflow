// TextFlow — Popup Logic
// Dark editorial theme — login, register, dashboard, settings, upgrade

(function () {
  'use strict';

  // ── State ──
  let auth = { token: null, userId: null, plan: 'free', usageToday: 0, name: '', email: '' };

  // ── Bootstrap ──
  document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    await loadAuthState();
    render();
  });

  // ── Navigation ──
  function setupNavigation() {
    document.querySelectorAll('[data-view]').forEach((el) => {
      el.addEventListener('click', () => showView(el.dataset.view));
    });

    document.getElementById('tf-login-form').addEventListener('submit', handleLogin);
    document.getElementById('tf-register-form').addEventListener('submit', handleRegister);
    document.getElementById('tf-logout-btn').addEventListener('click', handleLogout);
    document.getElementById('tf-settings-save').addEventListener('click', handleSaveSettings);
    document.getElementById('tf-checkout-pro').addEventListener('click', () => handleCheckout('pro'));
    document.getElementById('tf-checkout-pro-plus').addEventListener('click', () => handleCheckout('pro_plus'));
    document.getElementById('tf-manage-sub').addEventListener('click', handleManageSubscription);
  }

  function showView(name) {
    document.querySelectorAll('.tf-view').forEach((v) => v.classList.add('tf-hidden'));
    const view = document.getElementById('tf-' + name);
    if (view) {
      view.classList.remove('tf-hidden');
      if (name === 'dashboard') renderDashboard();
      if (name === 'settings') renderSettings();
    }
  }

  // ── Auth State ──
  async function loadAuthState() {
    try {
      const state = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' });
      auth = state;
    } catch (err) {
      console.error('[TextFlow] Auth load error:', err);
    }
  }

  function render() {
    if (auth.token) {
      showView('dashboard');
    } else {
      showView('login');
    }
  }

  // ── Auth Handlers ──
  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('tf-login-email').value.trim();
    const password = document.getElementById('tf-login-password').value;
    const errorEl = document.getElementById('tf-login-error');

    if (!email || !password) {
      errorEl.textContent = 'Preencha todos os campos.';
      errorEl.classList.remove('tf-hidden');
      return;
    }

    try {
      const res = await chrome.runtime.sendMessage({
        type: 'LOGIN',
        payload: { email, password },
      });

      if (res.error) {
        errorEl.textContent = res.error;
        errorEl.classList.remove('tf-hidden');
        return;
      }

      auth = { token: res.token, userId: res.user.id, plan: res.user.plan, usageToday: 0, name: res.user.name, email: res.user.email };
      errorEl.classList.add('tf-hidden');
      showView('dashboard');
    } catch (err) {
      errorEl.textContent = 'Erro de conexão.';
      errorEl.classList.remove('tf-hidden');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('tf-register-name').value.trim();
    const email = document.getElementById('tf-register-email').value.trim();
    const password = document.getElementById('tf-register-password').value;
    const errorEl = document.getElementById('tf-register-error');

    if (!email || !password) {
      errorEl.textContent = 'Email e senha são obrigatórios.';
      errorEl.classList.remove('tf-hidden');
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = 'Senha deve ter no mínimo 6 caracteres.';
      errorEl.classList.remove('tf-hidden');
      return;
    }

    try {
      const res = await chrome.runtime.sendMessage({
        type: 'REGISTER',
        payload: { email, password, name: name || undefined },
      });

      if (res.error) {
        errorEl.textContent = res.error;
        errorEl.classList.remove('tf-hidden');
        return;
      }

      auth = { token: res.token, userId: res.user.id, plan: res.user.plan, usageToday: 0, name: res.user.name, email: res.user.email };
      errorEl.classList.add('tf-hidden');
      showView('dashboard');
    } catch (err) {
      errorEl.textContent = 'Erro de conexão.';
      errorEl.classList.remove('tf-hidden');
    }
  }

  async function handleLogout() {
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    auth = { token: null, userId: null, plan: 'free', usageToday: 0, name: '', email: '' };
    showView('login');
  }

  // ── Dashboard ──
  function renderDashboard() {
    document.getElementById('tf-dash-name').textContent = auth.name || auth.email?.split('@')[0] || 'Usuário';
    document.getElementById('tf-dash-email').textContent = auth.email || '';
    document.getElementById('tf-dash-avatar').textContent = (auth.name || auth.email || 'U')[0].toUpperCase();

    const planLabels = { free: 'Grátis', pro: 'Pro', pro_plus: 'Pro+' };
    document.getElementById('tf-dash-plan').textContent = planLabels[auth.plan] || 'Grátis';

    // Show/hide manage subscription button
    const manageBtn = document.getElementById('tf-manage-sub');
    if (auth.plan !== 'free') {
      manageBtn.classList.remove('tf-hidden');
    } else {
      manageBtn.classList.add('tf-hidden');
    }

    const usage = auth.usageToday || 0;
    const max = auth.plan === 'free' ? 5 : Infinity;
    const pct = max === Infinity ? 0 : Math.min((usage / max) * 100, 100);

    document.getElementById('tf-dash-usage-label').textContent = max === Infinity ? usage + ' usos' : usage + '/' + max;
    document.getElementById('tf-dash-usage-fill').style.width = (max === Infinity ? 100 : pct) + '%';
  }

  // ── Settings ──
  function renderSettings() {
    document.getElementById('tf-settings-name').value = auth.name || '';
  }

  async function handleSaveSettings() {
    const name = document.getElementById('tf-settings-name').value.trim();
    const msgEl = document.getElementById('tf-settings-msg');

    if (!name) {
      msgEl.textContent = 'Digite um nome.';
      msgEl.classList.remove('tf-hidden');
      return;
    }

    try {
      const res = await chrome.runtime.sendMessage({
        type: 'UPDATE_PROFILE',
        payload: { name },
      });

      // Fallback: update locally if no dedicated handler
      auth.name = name;
      msgEl.textContent = 'Salvo!';
      msgEl.classList.remove('tf-hidden');
      setTimeout(() => msgEl.classList.add('tf-hidden'), 2000);
    } catch (err) {
      msgEl.textContent = 'Erro ao salvar.';
      msgEl.classList.remove('tf-hidden');
    }
  }

  // ── Stripe ──
  async function handleCheckout(plan) {
    try {
      const res = await chrome.runtime.sendMessage({
        type: 'STRIPE_CHECKOUT',
        payload: { plan },
      });
      if (res.url) {
        window.open(res.url, '_blank');
      } else if (res.error) {
        alert(res.error);
      }
    } catch (err) {
      alert('Erro ao conectar ao Stripe.');
    }
  }

  async function handleManageSubscription() {
    try {
      const res = await chrome.runtime.sendMessage({
        type: 'STRIPE_PORTAL',
      });
      if (res.url) {
        window.open(res.url, '_blank');
      } else if (res.error) {
        alert(res.error);
      }
    } catch (err) {
      alert('Erro ao abrir portal.');
    }
  }
})();
