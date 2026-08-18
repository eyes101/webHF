// api/client.js
//
// Every request carries a Firebase ID token in the Authorization header.
// Cloud Functions verifies it per-request (see functions/src/middleware/requireAuth.js).
// Firebase tokens expire hourly, so we always fetch a fresh one via getIdToken()
// right before each call.
import { auth } from '../config/firebase';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${idToken}`;
    } catch (e) {
      console.warn('Failed to retrieve Firebase ID token:', e);
    }
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `API error: ${res.status}`);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export const api = {
  auth: {
    getMe: () => apiFetch('/auth/me'),
  },
  services: {
    list: (category) =>
      apiFetch(`/services${category ? `?category=${encodeURIComponent(category)}` : ''}`),
    get: (slug) => apiFetch(`/services/${slug}`),
    adminList: () => apiFetch('/admin/services'),
    adminCreate: (data) =>
      apiFetch('/admin/services', { method: 'POST', body: JSON.stringify(data) }),
    adminUpdate: (id, data) =>
      apiFetch(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    adminDelete: (id) =>
      apiFetch(`/admin/services/${id}`, { method: 'DELETE' }),
  },
  artisans: {
    list: (trade) =>
      apiFetch(`/artisans${trade ? `?trade=${encodeURIComponent(trade)}` : ''}`),
    adminList: () => apiFetch('/admin/artisans'),
    adminCreate: (data) =>
      apiFetch('/admin/artisans', { method: 'POST', body: JSON.stringify(data) }),
    adminUpdate: (id, data) =>
      apiFetch(`/admin/artisans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    adminDelete: (id) =>
      apiFetch(`/admin/artisans/${id}`, { method: 'DELETE' }),
  },
  orders: {
    create: (items, notes, address, scheduled_for) =>
      apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ items, notes, address, scheduled_for }),
      }),
    list: (status, page = 1, limit = 20) => {
      const params = new URLSearchParams({ page, limit });
      if (status) params.set('status', status);
      return apiFetch(`/orders?${params.toString()}`);
    },
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
