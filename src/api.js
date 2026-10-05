const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000/api';

export const tokens = {
  get access() { return localStorage.getItem('access_token'); },
  get refresh() { return localStorage.getItem('refresh_token'); },
  save({ access_token, refresh_token }) {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
  },
  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

export function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

async function send(path, method, body, accessToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server');
  }
}

async function refreshTokens() {
  if (!tokens.refresh) return false;

  const res = await send('/refresh', 'POST', { refresh_token: tokens.refresh });
  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.tokens) {
    tokens.clear();
    window.dispatchEvent(new Event('session-expired'));
    return false;
  }

  tokens.save(data.tokens);
  return true;
}

async function request(path, { method = 'GET', body, auth = true } = {}, retry = true) {
  const res = await send(path, method, body, auth ? tokens.access : null);
  const data = await res.json().catch(() => null);

  if (res.status === 401 && auth && retry && (await refreshTokens())) {
    return request(path, { method, body, auth }, false);
  }

  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (data) => request('/register', { method: 'POST', body: data, auth: false }),

  async login(username, password) {
    const data = await request('/login', {
      method: 'POST',
      body: { username, password },
      auth: false,
    });
    tokens.save(data.tokens);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },

  async logout() {
    try {
      await request('/logout', {
        method: 'POST',
        body: { refresh_token: tokens.refresh },
        auth: false,
      });
    } finally {
      tokens.clear();
    }
  },

  listProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (product) => request('/products', { method: 'POST', body: product }),
  updateProduct: (id, product) => request(`/products/${id}`, { method: 'PUT', body: product }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};