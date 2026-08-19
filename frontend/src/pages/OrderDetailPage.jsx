// pages/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../utils/currency';

function getStatusStepIndex(status) {
  switch (status) {
    case 'completed': return 4;
    case 'in_progress': return 3;
    case 'paid': return 2;
    case 'awaiting_payment': return 1;
    default: return 1;
  }
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);

  const loadData = () => {
    Promise.all([
      api.orders.get(id),
      api.messages.list(id).catch(() => ({ messages: [] })),
    ])
      .then(([orderRes, messagesRes]) => {
        setOrder(orderRes.order);
        setMessages(messagesRes.messages || []);
      })
      .catch((err) => console.error('Failed to load order details:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      api.messages.list(id).then((res) => setMessages(res.messages || [])).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      await api.messages.send(id, newMessage.trim());
      setNewMessage('');
      const res = await api.messages.list(id);
      setMessages(res.messages || []);
    } catch (err) {
      alert('Error sending message: ' + (err.message || 'Please try again.'));
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--steel)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '36px', marginBottom: '16px' }}>
          Order Not Found
        </h1>
        <p style={{ color: 'var(--steel)', marginBottom: '24px' }}>
          We could not locate an order matching ID #{id}.
        </p>
        <Link to="/orders" className="btn btn-solid">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = getStatusStepIndex(order.status);
  const steps = [
    { label: 'Order Placed', num: 1 },
    { label: 'Payment Confirmed', num: 2 },
    { label: 'In Progress / Dispatched', num: 3 },
    { label: 'Completed', num: 4 },
  ];

  return (
    <div className="wrap" style={{ padding: '48px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--steel)', marginBottom: '24px' }}>
        <Link to="/orders" style={{ color: 'inherit' }}>← Back to Orders</Link>
        <span>/</span>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Order #{order.id.slice(0, 10)}</span>
      </nav>

      {/* Header Info */}
      <div className="card" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--steel)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Operations Dispatch
          </div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--ink)' }}>
            Order #{order.id.slice(0, 10)}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--steel)', fontWeight: 600 }}>Order Total</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
              {formatNaira(order.total_cents)}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress Bar */}
      <div className="card" style={{ marginBottom: '32px', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          {/* Connecting Line */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '40px',
              right: '40px',
              height: '3px',
              background: 'var(--line)',
              zIndex: 1,
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'var(--green)',
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {steps.map((st) => {
            const isDone = st.num <= currentStep;
            const isCurrent = st.num === currentStep;
            return (
              <div key={st.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, textAlign: 'center', width: '120px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isDone ? 'var(--green)' : '#ffffff',
                    color: isDone ? '#ffffff' : 'var(--steel)',
                    border: `3px solid ${isDone ? 'var(--green)' : 'var(--line)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px',
                    marginBottom: '10px',
                    boxShadow: isCurrent ? '0 0 0 4px var(--green-dim)' : 'none',
                  }}
                >
                  {isDone ? '✓' : st.num}
                </div>
                <span style={{ fontSize: '12px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--ink)' : 'var(--steel)' }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Column: Order Items & Delivery Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: 'var(--ink)' }}>
              Requested Services
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(order.items || []).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--paper-dim)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{item.service_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--steel)' }}>Quantity: {item.quantity}</div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--ink)' }}>
                    {formatNaira(item.unit_price_cents * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: 'var(--ink)' }}>
              Execution &amp; Delivery Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div>
                <span style={{ color: 'var(--steel)', display: 'block', fontSize: '12px', fontWeight: 600 }}>Destination Address</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{order.address || 'Address on file'}</span>
              </div>
              {order.notes && (
                <div>
                  <span style={{ color: 'var(--steel)', display: 'block', fontSize: '12px', fontWeight: 600 }}>Special Instructions</span>
                  <span>{order.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Support & Message Thread */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '560px' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
                Direct Dispatch Chat
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--steel)' }}>Communicate with operations staff</div>
            </div>
            <span className="badge badge-green">Live Support</span>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '16px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--steel)', fontSize: '13px', margin: 'auto 0' }}>
                No messages yet. Send a message to get direct updates from our dispatch team.
              </div>
            ) : (
              messages.map((msg) => {
                const isCustomer = msg.sender_role === 'customer';
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      background: isCustomer ? 'var(--ink)' : 'var(--paper-dim)',
                      color: isCustomer ? '#ffffff' : 'var(--ink)',
                      border: isCustomer ? 'none' : '1px solid var(--line)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '2px', opacity: 0.75 }}>
                      {isCustomer ? 'You' : 'Halfcon Operations'}
                    </div>
                    <div>{msg.body}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input"
              placeholder="Type message to dispatch team..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sendingMsg}
            />
            <button
              type="submit"
              className="btn btn-solid"
              disabled={sendingMsg || !newMessage.trim()}
              style={{ flexShrink: 0 }}
            >
              {sendingMsg ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
