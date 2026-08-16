import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      setVerificationSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFacebook = async () => {
    setError('');
    try {
      await loginWithFacebook();
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    }
  };

  if (verificationSent) {
    return (
      <div className="wrap" style={{ padding: '60px 32px', maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📧</div>
        <h1 style={{ marginBottom: '16px' }}>Check your email</h1>
        <p style={{ color: 'var(--steel)' }}>
          We sent a verification link to <strong>{email}</strong>. Click it, then come back and log in.
        </p>
        <a href="/login" className="btn btn-solid" style={{ marginTop: '24px', display: 'inline-block' }}>
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '60px 32px', maxWidth: '400px' }}>
      <h1 style={{ marginBottom: '30px' }}>Create account</h1>
      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <button type="button" className="btn" onClick={handleGoogle} style={{ width: '100%' }}>
          Continue with Google
        </button>
        <button type="button" className="btn" onClick={handleFacebook} style={{ width: '100%' }}>
          Continue with Facebook
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: 'var(--steel)', fontSize: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />OR<div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
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
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required minLength={6} />
        </div>
        <button type="submit" className="btn btn-solid" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
