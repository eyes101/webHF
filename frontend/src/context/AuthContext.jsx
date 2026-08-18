// context/AuthContext.jsx
//
// Firebase Auth is the single source of truth for identity.
// onIdTokenChanged listens for sign-in, sign-out, and silent hourly token refreshes.
// We synchronize the user's role and database profile from /api/auth/me while
// supporting unverified email alerts, password resets, and OAuth flows.
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onIdTokenChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  // Sync profile with backend
  const syncProfile = useCallback(async (fbUser) => {
    if (!fbUser) {
      setUser(null);
      setFirebaseUser(null);
      setIsEmailVerified(false);
      return;
    }

    setFirebaseUser(fbUser);
    setIsEmailVerified(Boolean(fbUser.emailVerified));

    try {
      const res = await api.auth.getMe();
      if (res?.user) {
        setUser({
          ...res.user,
          email_verified: fbUser.emailVerified,
        });
      } else {
        throw new Error('No user data returned');
      }
    } catch (err) {
      // Fallback profile if Cloud Function is initializing or offline
      setUser({
        id: fbUser.uid,
        name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
        email: fbUser.email,
        role: 'customer',
        email_verified: fbUser.emailVerified,
        photoURL: fbUser.photoURL || null,
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (fbUser) => {
      try {
        await syncProfile(fbUser);
      } catch (err) {
        console.error('Failed to sync auth state:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [syncProfile]);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncProfile(result.user);
      return result.user;
    } catch (err) {
      const msg = friendlyFirebaseError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithFacebook = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await syncProfile(result.user);
      return result.user;
    } catch (err) {
      const msg = friendlyFirebaseError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncProfile(result.user);
      return result.user;
    } catch (err) {
      const msg = friendlyFirebaseError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name && name.trim()) {
        await updateProfile(result.user, { displayName: name.trim() });
      }
      try {
        await sendEmailVerification(result.user);
      } catch (e) {
        console.warn('Could not send verification email automatically:', e);
      }
      await syncProfile(result.user);
      return { user: result.user, email: email.trim() };
    } catch (err) {
      const msg = friendlyFirebaseError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const sendPasswordReset = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err) {
      const msg = friendlyFirebaseError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('You must be signed in to request a verification email.');
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (err) {
      const msg = friendlyFirebaseError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const reloadUser = async () => {
    if (!auth.currentUser) return null;
    try {
      await auth.currentUser.reload();
      await syncProfile(auth.currentUser);
      return auth.currentUser;
    } catch (err) {
      console.error('Failed to reload user profile:', err);
      return null;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setIsEmailVerified(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        setError,
        isEmailVerified,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        sendPasswordReset,
        resendVerificationEmail,
        reloadUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function friendlyFirebaseError(err) {
  if (!err) return 'An unknown error occurred.';
  const code = err.code || '';
  const message = err.message || '';

  const map = {
    'auth/email-already-in-use': 'An account with this email address already exists. Please log in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/invalid-credential': 'Incorrect email or password. Please verify your details.',
    'auth/too-many-requests': 'Too many unsuccessful attempts. Access temporarily paused — please wait a moment or reset your password.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    'auth/unauthorized-domain': 'This domain is not yet authorized in Firebase Console (Authentication > Settings > Authorized Domains).',
    'auth/operation-not-allowed': 'This sign-in method is currently disabled in your Firebase console.',
    'auth/network-request-failed': 'Network connection failed. Please check your internet connection.',
    'auth/requires-recent-login': 'For security, please log out and log back in to perform this action.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
  };

  return map[code] || message || 'Something went wrong. Please try again.';
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
