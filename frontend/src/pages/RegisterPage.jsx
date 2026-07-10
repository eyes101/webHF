import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password, phone);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleToken = async (idToken) => {
    setError('');
    try {
      await loginWithGoogle(idToken);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="wrap" style={{ padding: '60px 32px', maxWidth: '400px' }}>
      <h1 style={{ marginBottom: '30px' }}>Create account</h1>
      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div style={{ marginBottom: '20px' }}>
        <GoogleSignInButton onToken={handleGoogleToken} onError={setError} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: 'var(--steel)', fontSize: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
        OR
        <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Phone (optional)</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
        </div>
        <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>Register</button>
      </form>
    </div>
  );
}
