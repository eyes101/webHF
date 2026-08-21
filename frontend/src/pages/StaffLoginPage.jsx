// pages/StaffLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/Auth.css';

export default function StaffLoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as staff/admin, redirect directly to /staff
  React.useEffect(() => {
    if (user && (user.role === 'staff' || user.role === 'admin')) {
      navigate('/staff');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'staff' && loggedUser.role !== 'admin') {
        setError('Access Restricted: This account does not have staff or administrator privileges.');
        setLoading(false);
        return;
      }
      navigate('/staff');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: 'radial-gradient(circle at 50% 20%, #1A2E6E 0%, #0F1B4C 100%)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#0F1B4C',
              color: 'var(--rust)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(15, 27, 76, 0.2)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <div
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--rust)',
              background: 'var(--rust-light)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '8px',
            }}
          >
            Halfcon Operations Staff
          </div>

          <h1
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: '32px',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--ink)',
              letterSpacing: '0.02em',
            }}
          >
            Staff Portal Login
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--steel)' }}>
            Authorized dispatchers, engineers, and support managers.
          </p>
        </div>

        {error && (
          <div
            className="error"
            style={{
              marginBottom: '20px',
              fontSize: '13px',
              lineHeight: 1.5,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
              Staff Email Address
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. staff@halfcon.it.com"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter staff security password"
                required
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--steel)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-solid btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: '6px', background: '#0F1B4C', borderColor: '#0F1B4C' }}
          >
            {loading ? <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#fff' }} /> : 'Authenticate & Enter Dashboard →'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--steel)' }}>Are you a customer? </span>
          <Link to="/login" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--rust)' }}>
            Customer Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
