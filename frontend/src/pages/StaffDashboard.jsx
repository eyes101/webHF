// pages/StaffDashboard.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

const STATUS_OPTIONS = ['pending', 'awaiting_payment', 'paid', 'in_progress', 'completed', 'cancelled'];

export default function StaffDashboard() {
  const [tab, setTab] = useState('orders');
  return (
    <div className="wrap" style={{ padding: '60px 32px' }}>
      <h1 style={{ marginBottom: '10px', fontFamily: "'Big Shoulders Display', sans-serif", textTransform: 'uppercase', fontSize: '36px' }}>
        Staff dashboard
      </h1>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', borderBottom: '2px solid var(--ink)', paddingBottom: '12px' }}>
        {['orders', 'services', 'payments', 'customers'].map((t) => (
          <button
            key={t}
            className={`btn ${tab === t ? 'btn-solid' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'orders' && <OrdersTab />}
      {tab === 'services' && <ServicesTab />}
      {tab === 'payments' && <PaymentsTab />}
      {tab === 'customers' && <CustomersTab />}
    </div>
  );
}

const STAFF_PAGE_SIZE = 20;

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    api.orders.list(statusFilter || undefined, page, STAFF_PAGE_SIZE)
      .then((res) => {
        setOrders(res.orders);
        setTotalPages(res.total_pages);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter, page]);

  const handleFilterChange = (newStatus) => {
    // Reset to page 1 whenever the filter changes, so we don't get stuck
    // on a page number that no longer exists for the new filter.
    setPage(1);
    setStatusFilter(newStatus);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      load();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!statusFilter ? 'btn-solid' : ''}`} onClick={() => handleFilterChange('')}>All</button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-solid' : ''}`} onClick={() => handleFilterChange(s)}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ color: 'var(--steel)' }}>No orders found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ink)' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Order</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Items</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Address</th>
              <th style={{ textAlign: 'right', padding: '10px' }}>Total</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                  #{o.id.slice(0, 8)}
                </td>
                <td style={{ padding: '10px', fontSize: '13px' }}>
                  {o.items?.map((i) => `${i.service_name} x${i.quantity}`).join(', ')}
                </td>
                <td style={{ padding: '10px', fontSize: '13px', maxWidth: '200px' }}>{o.address || '—'}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatNaira(o.total_cents)}
                </td>
                <td style={{ padding: '10px' }}>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="input"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', justifyContent: 'center' }}>
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{ opacity: page <= 1 ? 0.4 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '13px', color: 'var(--steel)' }}>
            Page {page} of {totalPages} &middot; {total} order{total !== 1 ? 's' : ''} total
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{ opacity: page >= totalPages ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function ServicesTab() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', name: '', description: '', price_naira: '', unit: 'flat' });

  const load = () => {
    setLoading(true);
    api.services.adminList().then((res) => setServices(res.services)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.services.adminCreate({
        category: form.category,
        name: form.name,
        description: form.description,
        price_cents: Math.round(parseFloat(form.price_naira) * 100),
        currency: 'NGN',
        unit: form.unit,
      });
      setForm({ category: '', name: '', description: '', price_naira: '', unit: 'flat' });
      setShowForm(false);
      load();
    } catch (err) {
      alert('Error creating service: ' + err.message);
    }
  };

  const toggleActive = async (service) => {
    try {
      await api.services.adminUpdate(service.id, { active: service.active ? 0 : 1 });
      load();
    } catch (err) {
      alert('Error updating service: ' + err.message);
    }
  };

  return (
    <div>
      <button className="btn btn-solid" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px' }}>
        {showForm ? 'Cancel' : '+ Add service'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: '24px', maxWidth: '500px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Category</label>
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Description</label>
            <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Price (₦)</label>
              <input type="number" step="0.01" className="input" value={form.price_naira} onChange={(e) => setForm({ ...form, price_naira: e.target.value })} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Unit</label>
              <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="flat">flat</option>
                <option value="hourly">hourly</option>
                <option value="per_km">per_km</option>
                <option value="per_sqm">per_sqm</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-solid">Create service</button>
        </form>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ink)' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Service</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Category</th>
              <th style={{ textAlign: 'right', padding: '10px' }}>Price</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px', fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: '10px', fontSize: '13px' }}>{s.category}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatNaira(s.price_cents)} <span style={{ color: 'var(--steel)', fontSize: '11px' }}>/{s.unit}</span>
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ color: s.active ? 'var(--green)' : 'var(--steel)', fontSize: '12px', fontWeight: 600 }}>
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <button className="btn btn-sm" onClick={() => toggleActive(s)}>
                    {s.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.payments().then((res) => setPayments(res.payments)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--ink)' }}>
          <th style={{ textAlign: 'left', padding: '10px' }}>Payment</th>
          <th style={{ textAlign: 'left', padding: '10px' }}>Order</th>
          <th style={{ textAlign: 'left', padding: '10px' }}>Provider</th>
          <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
          <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => (
          <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
            <td style={{ padding: '10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>#{p.id.slice(0, 8)}</td>
            <td style={{ padding: '10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>#{p.order_id.slice(0, 8)}</td>
            <td style={{ padding: '10px' }}>{p.provider}</td>
            <td style={{ padding: '10px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{formatNaira(p.amount_cents)}</td>
            <td style={{ padding: '10px' }}>
              <span style={{ color: p.status === 'succeeded' ? 'var(--green)' : 'var(--steel)', fontWeight: 600, fontSize: '12px' }}>
                {p.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CustomersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.users().then((res) => setUsers(res.users)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--ink)' }}>
          <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
          <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
          <th style={{ textAlign: 'left', padding: '10px' }}>Phone</th>
          <th style={{ textAlign: 'left', padding: '10px' }}>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
            <td style={{ padding: '10px', fontWeight: 600 }}>{u.name}</td>
            <td style={{ padding: '10px', fontSize: '13px' }}>{u.email}</td>
            <td style={{ padding: '10px', fontSize: '13px' }}>{u.phone || '—'}</td>
            <td style={{ padding: '10px', fontSize: '12px', textTransform: 'uppercase' }}>{u.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
