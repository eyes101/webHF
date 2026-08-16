import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password changes only make sense for accounts that HAVE a password —
  // Google/Facebook-only accounts have nothing to change here. Firebase
  // tracks this per sign-in method on the current user's providerData.
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
      // Firebase requires a recent sign-in before allowing a password
      // change — re-verify with their current password first.
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setSuccess('Password changed successfully.');
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

  return (
    <div className="wrap" style={{ padding: '60px 32px', maxWidth: '480px' }}>
      <h1 style={{ marginBottom: '10px' }}>Account settings</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        {user?.name} &middot; {user?.email}
      </p>

      <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Change password</h2>

      {!hasPasswordProvider ? (
        <p style={{ color: '#666' }}>
          This account signs in with Google or Facebook, so there's no password to change here.
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
              minLength={6}
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
              minLength={6}
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
