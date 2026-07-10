// api/client.js
//
// In local development, API_BASE is left as '/api' and Vite's dev proxy
// (see vite.config.js) forwards those requests to localhost:4000.
//
// In production (deployed on Vercel), there is no dev proxy, so we need the
// full backend URL. Set VITE_API_URL in Vercel's environment variables to
// your Railway backend's public URL, e.g.:
//   VITE_API_URL=https://new-halfcon-production.up.railway.app
//
// Vite only exposes env vars prefixed with VITE_ to client-side code, and
// only bakes them in at BUILD time — so this must be set in Vercel's
// project settings BEFORE building, not as a runtime secret.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    credentials: 'include', // send/receive the session cookie cross-origin
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };
  const res = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
  return data;
}

export const api = {
  auth: {
    register: (name, email, password, phone) =>
      apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
      }),
    login: (email, password) =>
      apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    getMe: () => apiFetch('/auth/me'),
    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  },
  services: {
    list: (category) =>
      apiFetch(`/services${category ? `?category=${category}` : ''}`),
    get: (slug) => apiFetch(`/services/${slug}`),
    adminList: () => apiFetch('/admin/services'),
    adminCreate: (data) =>
      apiFetch('/admin/services', { method: 'POST', body: JSON.stringify(data) }),
    adminUpdate: (id, data) =>
      apiFetch(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    adminDelete: (id) =>
      apiFetch(`/admin/services/${id}`, { method: 'DELETE' }),
  },
  orders: {
    create: (items, notes, address, scheduled_for) =>
      apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ items, notes, address, scheduled_for }),
      }),
    list: (status) =>
      apiFetch(`/orders${status ? `?status=${status}` : ''}`),
    get: (id) => apiFetch(`/orders/${id}`),
    updateStatus: (id, status) =>
      apiFetch(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  payments: {
    checkout: (orderId) =>
      apiFetch(`/orders/${orderId}/checkout`, { method: 'POST' }),
    simulateSuccess: (paymentId) =>
      apiFetch(`/payments/${paymentId}/simulate-success`, { method: 'POST' }),
  },
  messages: {
    list: (orderId) => apiFetch(`/orders/${orderId}/messages`),
    send: (orderId, body) =>
      apiFetch(`/orders/${orderId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
  },
  admin: {
    users: () => apiFetch('/admin/users'),
    payments: () => apiFetch('/admin/payments'),
  },
};
