// This file is identical to the previous version; it uses relative URLs.
const BASE_URL = '';

const showMessage = (id, msg, type = 'error') => {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.className = `message ${type}`; }
};

const setLoading = (id, isLoading) => {
  const el = document.getElementById(id);
  if (el) el.style.display = isLoading ? 'block' : 'none';
};

const getToken = () => localStorage.getItem('token');
const redirectIfLoggedIn = () => { if (getToken()) window.location.href = 'dashboard.html'; };
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
};

const path = window.location.pathname.split('/').pop();

// Register page
if (path === 'register.html' || path === '') {
  redirectIfLoggedIn();
  document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    showMessage('message', '');
    setLoading('loading', true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMessage('message', data.message, 'success');
      setTimeout(() => { window.location.href = `verify.html?email=${encodeURIComponent(email)}`; }, 1500);
    } catch (err) {
      showMessage('message', err.message, 'error');
    } finally { setLoading('loading', false); }
  });
}

// Verify page
if (path === 'verify.html') {
  redirectIfLoggedIn();
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get('email');
  if (emailParam) document.getElementById('email').value = emailParam;

  document.getElementById('verifyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const otp = document.getElementById('otp').value.trim();
    const password = document.getElementById('password').value.trim();
    showMessage('message', '');
    setLoading('loading', true);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMessage('message', data.message, 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } catch (err) {
      showMessage('message', err.message, 'error');
    } finally { setLoading('loading', false); }
  });

  document.getElementById('resendBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if (!email) return showMessage('message', 'Please enter your email first.', 'error');
    setLoading('loading', true);
    try {
      const res = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMessage('message', data.message, 'success');
    } catch (err) {
      showMessage('message', err.message, 'error');
    } finally { setLoading('loading', false); }
  });
}

// Login page
if (path === 'login.html') {
  redirectIfLoggedIn();
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    showMessage('message', '');
    setLoading('loading', true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showMessage('message', err.message, 'error');
    } finally { setLoading('loading', false); }
  });
}

// Dashboard
if (path === 'dashboard.html') {
  if (!getToken()) window.location.href = 'login.html';
  (async () => {
    try {
      const res = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Not authorized');
      const data = await res.json();
      document.getElementById('userName').textContent = data.name;
    } catch {
      logout();
    }
  })();
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
}
