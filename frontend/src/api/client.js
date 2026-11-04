// api/client.js
// API client for the Halfcon backend. Auth tokens come from the Supabase
// session. (Migration M3: the old direct-Firestore fallbacks are gone —
// Firestore denied client access anyway, so they never worked. A
// localStorage copy of the customer's own orders remains as a read-only
// safety net when the API is unreachable.)
import { supabase } from '../config/supabase';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

async function authHeaders() {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch (netErr) {
    // If an absolute API URL fails at the network level, retry the
    // relative /api path (same-origin proxies / rewrites).
    if (API_BASE.startsWith('https://')) {
      try {
        res = await fetch(`/api${endpoint}`, { ...options, headers });
      } catch (e2) {
        throw new Error(`Network error: ${netErr.message}`);
      }
    } else {
      throw new Error(`Network error: ${netErr.message}`);
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `API error: ${res.status}`);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

// Local Orders Storage Helper — read-only safety net for the customer's
// own orders (mirrors successful API creates).
function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem('halfcon_orders') || '[]');
  } catch {
    return [];
  }
}

function saveLocalOrder(order) {
  try {
    const list = getLocalOrders().filter((o) => o.id !== order.id);
    list.unshift(order);
    localStorage.setItem('halfcon_orders', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save order to localStorage:', e);
  }
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
    create: async (items, notes, address, scheduled_for, promoCode) => {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ items, notes, address, scheduled_for, promo_code: promoCode || undefined }),
      });
      if (res.order) saveLocalOrder(res.order);
      return res;
    },

    list: async (status, page = 1, limit = 20) => {
      try {
        const params = new URLSearchParams({ page, limit });
        if (status) params.set('status', status);
        const res = await apiFetch(`/orders?${params.toString()}`);
        if (res.orders) return res;
      } catch (err) {
        console.warn('orders.list API unavailable, using local safety net:', err);
      }
      const local = getLocalOrders();
      return { orders: local, total: local.length, page: 1, limit };
    },

    get: async (id) => {
      try {
        const res = await apiFetch(`/orders/${id}`);
        if (res.order) return res;
      } catch (err) {
        console.warn('orders.get API unavailable, using local safety net:', err);
      }
      const local = getLocalOrders().find((o) => o.id === id);
      if (local) return { order: local };
      throw new Error(`Order ${id} not found.`);
    },

    track: async (id) => {
      const clean = (id || '').trim();
      try {
        return await apiFetch(`/orders/track/${encodeURIComponent(clean)}`);
      } catch (err) {
        const local = getLocalOrders().find((o) => o.id === clean);
        if (local) {
          return {
            tracking: {
              id: local.id,
              status: local.status,
              created_at: local.created_at,
              updated_at: local.updated_at,
              items: (local.items || []).map((i) => ({
                service_name: i.service_name,
                quantity: i.quantity,
              })),
            },
          };
        }
        throw err;
      }
    },

    updateStatus: async (id, status) => {
      const res = await apiFetch(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      // Mirror the change into the local safety-net copy, if one exists.
      const local = getLocalOrders().find((o) => o.id === id);
      if (local) {
        local.status = status;
        saveLocalOrder(local);
      }
      return res;
    },
  },

  payments: {
    checkout: (orderId) =>
      apiFetch(`/orders/${orderId}/checkout`, { method: 'POST' }),

    simulateSuccess: (paymentId) =>
      apiFetch(`/payments/${paymentId}/simulate-success`, { method: 'POST' }),

    verify: (reference) =>
      apiFetch(`/payments/verify/${encodeURIComponent(reference)}`),
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
    updateUserRole: (userId, role) =>
      apiFetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    inviteStaff: (data) =>
      apiFetch('/admin/users/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    payments: () => apiFetch('/admin/payments'),
  },
};

// Safe utility re-exports
export { whatsappLink } from '../config/contacts';
export { formatNaira } from '../utils/currency';
