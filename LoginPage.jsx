import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="wrap" style={{ padding: '60px 32px', maxWidth: '400px' }}>
      <h1 style={{ marginBottom: '30px' }}>Login</h1>
      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
        </div>
        <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>Login</button>
      </form>
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        Don't have an account? <a href="/register" style={{ color: 'var(--rust)' }}>Register</a>
      </div>
    </div>
  );
}
