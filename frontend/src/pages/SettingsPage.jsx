// pages/SettingsPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function SettingsPage() {
  const { user, isEmailVerified, resendVerificationEmail, reloadUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const currentUser = auth.currentUser;
  const hasPasswordProvider = currentUser?.providerData?.some((p) => p.providerId === 'password');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const map = {
        'auth/wrong-password': 'Current password is incorrect.',
        'auth/invalid-credential': 'Current password is incorrect.',
        'auth/too-many-requests': 'Too many attempts — please wait a moment and try again.',
      };
      setError(map[err.code] || err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('Sending verification link...');
    try {
      await resendVerificationEmail();
      setResendStatus('Verification link sent! Check your inbox and spam folder.');
    } catch (err) {
      setResendStatus('Failed to send link: ' + (err.message || 'Please try again.'));
    }
  };

  const handleCheckStatus = async () => {
    setResendStatus('Checking verification status...');
    const refreshed = await reloadUser();
    if (refreshed?.emailVerified) {
      setResendStatus('Email is verified! Thank you.');
    } else {
      setResendStatus('Your email is still marked unverified. Please check your inbox.');
    }
  };

  return (
    <div className="wrap" style={{ padding: '60px 32px', maxWidth: '520px' }}>
      <h1
        style={{
          marginBottom: '8px',
          fontSize: '36px',
          fontFamily: "'Big Shoulders Display', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        Account Settings
      </h1>
      <p style={{ color: 'var(--steel)', marginBottom: '28px', fontSize: '15px' }}>
        Manage your profile, security, and verification status.
      </p>

      {/* Account Info Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>{user?.name}</div>
            <div style={{ fontSize: '14px', color: 'var(--steel)' }}>{user?.email}</div>
          </div>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '4px',
              background: user?.role === 'admin' || user?.role === 'staff' ? 'var(--ink)' : 'var(--paper-dim)',
              color: user?.role === 'admin' || user?.role === 'staff' ? '#fff' : 'var(--ink)',
            }}
          >
            {user?.role || 'Customer'}
          </span>
        </div>

        {/* Email Verification Banner */}
        {!isEmailVerified && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '6px',
              background: 'var(--rust-dim)',
              border: '1px solid #FDE68A',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', marginBottom: '8px' }}>
              Your email address is unverified
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm btn-solid"
                onClick={handleResend}
              >
                Resend Link
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleCheckStatus}
              >
                Check Status
              </button>
            </div>
            {resendStatus && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#92400E', fontWeight: 500 }}>
                {resendStatus}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Change Password Card */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--ink)' }}>
          Security &amp; Password
        </h2>

        {!hasPasswordProvider ? (
          <p style={{ color: 'var(--steel)', fontSize: '14px', lineHeight: 1.5 }}>
            This account signs in with Google or Facebook. Your credentials are securely managed by your identity provider.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                Current password
              </label>
              <input
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                New password
              </label>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                Confirm new password
              </label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
            {success && <div className="success" style={{ marginBottom: '16px' }}>{success}</div>}

            <button className="btn btn-solid" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
