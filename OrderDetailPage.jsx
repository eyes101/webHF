import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { formatNaira } from '../utils/currency';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.orders.get(id),
      api.messages.list(id),
    ]).then(([orderRes, messagesRes]) => {
      setOrder(orderRes.order);
      setMessages(messagesRes.messages);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.messages.send(id, newMessage);
      setNewMessage('');
      const res = await api.messages.list(id);
      setMessages(res.messages);
    } catch (err) {
      alert('Error sending message');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!order) return <div style={{ padding: '40px', textAlign: 'center' }}>Order not found</div>;

  return (
    <div className="wrap" style={{ padding: '60px 32px', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '20px' }}>Order #{order.id.slice(0, 8)}</h1>
      <div style={{ padding: '16px', background: '#EAE7DE', marginBottom: '20px', borderRadius: '4px' }}>
        <div style={{ fontWeight: 600 }}>Status: {order.status}</div>
        <div>Total: {formatNaira(order.total_cents)}</div>
      </div>
      <h2 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>Items</h2>
      {order.items && order.items.map((item) => (
        <div key={item.id} style={{ padding: '12px', borderBottom: '1px solid #D8D3C6' }}>
          {item.service_name} x {item.quantity}
        </div>
      ))}
      <h2 style={{ marginTop: '30px', marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>Messages</h2>
      <div style={{ minHeight: '200px', padding: '12px', background: '#F5F3EE', borderRadius: '4px', marginBottom: '12px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '12px', padding: '8px', background: '#EAE7DE', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#5C6B73' }}>{msg.sender_role}</div>
            <div>{msg.body}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="input"
          placeholder="Send a message..."
          style={{ flex: 1 }}
        />
        <button className="btn btn-solid" onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
