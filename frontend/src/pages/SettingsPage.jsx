import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isGoogleAccount = user?.auth_provider === 'google';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap" style={{ padding: '60px 32px', maxWidth: '480px' }}>
      <h1 style={{ marginBottom: '10px' }}>Account settings</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        {user?.name} &middot; {user?.email}
      </p>

      <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Change password</h2>

      {isGoogleAccount ? (
        <p style={{ color: '#666' }}>
          This account signs in with Google, so there's no password to change here.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              New password
            </label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Confirm new password
            </label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && <p style={{ color: '#c0392b', marginBottom: '16px' }}>{error}</p>}
          {success && <p style={{ color: '#1e8449', marginBottom: '16px' }}>{success}</p>}

          <button className="btn btn-solid" type="submit" disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Saving...' : 'Change password'}
          </button>
        </form>
      )}
    </div>
  );
}
