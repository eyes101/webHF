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
      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', borderBottom: '2px solid var(--ink)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'orders', label: 'Orders & Dispatches' },
          { id: 'services', label: 'Services Catalog' },
          { id: 'artisans', label: 'Artisan Directory' },
          { id: 'payments', label: 'Transactions' },
          { id: 'users', label: 'Staff & User Access' },
        ].map((t) => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-solid' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'orders' && <OrdersTab />}
      {tab === 'services' && <ServicesTab />}
      {tab === 'artisans' && <ArtisansTab />}
      {tab === 'payments' && <PaymentsTab />}
      {tab === 'users' && <UsersTab />}
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

function ArtisansTab() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', trade: '', services_offered: '', phone: '', bio: '' });

  const load = () => {
    setLoading(true);
    api.artisans.adminList().then((res) => setArtisans(res.artisans)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.artisans.adminCreate({
        name: form.name,
        trade: form.trade,
        services_offered: form.services_offered.split(',').map((s) => s.trim()).filter(Boolean),
        phone: form.phone || null,
        bio: form.bio || null,
      });
      setForm({ name: '', trade: '', services_offered: '', phone: '', bio: '' });
      setShowForm(false);
      load();
    } catch (err) {
      alert('Error creating artisan: ' + err.message);
    }
  };

  const toggleActive = async (artisan) => {
    try {
      await api.artisans.adminUpdate(artisan.id, { active: !artisan.active });
      load();
    } catch (err) {
      alert('Error updating artisan: ' + err.message);
    }
  };

  return (
    <div>
      <button className="btn btn-solid" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px' }}>
        {showForm ? 'Cancel' : '+ Add artisan'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: '24px', maxWidth: '500px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Trade (e.g. Electrician, Plumber)</label>
            <input className="input" value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} required />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
              Services offered (comma-separated)
            </label>
            <input
              className="input"
              placeholder="Wiring, socket repair, generator installation"
              value={form.services_offered}
              onChange={(e) => setForm({ ...form, services_offered: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Phone (optional)</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Bio (optional)</label>
            <textarea className="input" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-solid">Create artisan</button>
        </form>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ink)' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Trade</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Services offered</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}></th>
            </tr>
          </thead>
          <tbody>
            {artisans.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px', fontWeight: 600 }}>{a.name}</td>
                <td style={{ padding: '10px', fontSize: '13px' }}>{a.trade}</td>
                <td style={{ padding: '10px', fontSize: '13px' }}>{(a.services_offered || []).join(', ')}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ color: a.active ? 'var(--green)' : 'var(--steel)', fontSize: '12px', fontWeight: 600 }}>
                    {a.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <button className="btn btn-sm" onClick={() => toggleActive(a)}>
                    {a.active ? 'Deactivate' : 'Activate'}
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

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [statusMsg, setStatusMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.admin.users()
      .then((res) => setUsers(res.users || []))
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      setStatusMsg(`User role updated to ${newRole}.`);
      setTimeout(() => setStatusMsg(''), 3000);
      load();
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const handleInviteStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await api.admin.inviteStaff({ email: inviteEmail, name: inviteName, role: inviteRole });
      setStatusMsg(res.message || 'Staff member authorized!');
      setInviteEmail('');
      setInviteName('');
      setShowInviteForm(false);
      setTimeout(() => setStatusMsg(''), 4000);
      load();
    } catch (err) {
      alert('Error inviting staff: ' + err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!roleFilter) return true;
    return (u.role || 'customer').toLowerCase() === roleFilter.toLowerCase();
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${!roleFilter ? 'btn-solid' : ''}`} onClick={() => setRoleFilter('')}>
            All Users ({users.length})
          </button>
          <button className={`btn btn-sm ${roleFilter === 'staff' ? 'btn-solid' : ''}`} onClick={() => setRoleFilter('staff')}>
            Staff ({users.filter((u) => u.role === 'staff').length})
          </button>
          <button className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-solid' : ''}`} onClick={() => setRoleFilter('admin')}>
            Admins ({users.filter((u) => u.role === 'admin').length})
          </button>
          <button className={`btn btn-sm ${roleFilter === 'customer' ? 'btn-solid' : ''}`} onClick={() => setRoleFilter('customer')}>
            Customers ({users.filter((u) => !u.role || u.role === 'customer').length})
          </button>
        </div>

        <button
          type="button"
          className="btn btn-solid"
          onClick={() => setShowInviteForm(!showInviteForm)}
        >
          {showInviteForm ? 'Cancel' : '+ Authorize New Staff Email'}
        </button>
      </div>

      {statusMsg && (
        <div className="success" style={{ marginBottom: '16px' }}>
          ✓ {statusMsg}
        </div>
      )}

      {showInviteForm && (
        <form onSubmit={handleInviteStaff} className="card" style={{ marginBottom: '24px', background: 'var(--paper-dim)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: 'var(--ink)' }}>
            Authorize New Staff Account
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--steel)', marginBottom: '16px' }}>
            Pre-authorize an employee's email. When they register on the site or log in with Google, they will automatically be granted staff dashboard permissions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Employee Email *</label>
              <input
                type="email"
                className="input"
                required
                placeholder="staff@halfcon.site"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Staff Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Operations Supervisor"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Role</label>
              <select
                className="input"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="staff">Staff Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn btn-solid">
              Authorize Account
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div>Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ color: 'var(--steel)' }}>No users found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ink)' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Access Role</th>
              <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '10px', fontSize: '13px' }}>{u.email}</td>
                <td style={{ padding: '10px', fontSize: '13px' }}>{u.phone || '—'}</td>
                <td style={{ padding: '10px' }}>
                  <span
                    className={`badge ${u.role === 'admin' ? 'badge-amber' : u.role === 'staff' ? 'badge-blue' : 'badge-gray'}`}
                    style={{ textTransform: 'uppercase', fontSize: '11px' }}
                  >
                    {u.role || 'customer'}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  <select
                    value={u.role || 'customer'}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="input"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
