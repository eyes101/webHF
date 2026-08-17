// context/AuthContext.jsx
//
// Firebase is now the single source of truth for "am I logged in" — we
// listen to onIdTokenChanged and react to it, rather than manually managing
// a token in localStorage like before. Every sign-in method (Google,
// Facebook, email/password) just needs to succeed with Firebase; this
// listener picks up the result automatically and fetches the matching
// profile (role, etc.) from our backend.
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onIdTokenChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { api } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fires on sign-in, sign-out, AND whenever Firebase silently refreshes
    // the token in the background (roughly hourly) — the profile fetch is
    // cheap and keeps `user` in sync without us managing that manually.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Failed to load profile:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithFacebook = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(friendlyFirebaseError(err));
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(result.user, { displayName: name });
      // Our backend requires a verified email before it'll trust this
      // identity (see functions/src/middleware/requireAuth.js) — send the
      // verification link automatically.
      await sendEmailVerification(result.user);
      // Sign them out until they verify — onIdTokenChanged would otherwise
      // treat them as logged-out anyway (emailVerified is false), but this
      // keeps Firebase's own local state clean too.
      await firebaseSignOut(auth);
      return { verificationSent: true, email };
    } catch (err) {
      setError(friendlyFirebaseError(err));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, loginWithGoogle, loginWithFacebook, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function friendlyFirebaseError(err) {
  const code = err?.code || '';
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'That email address looks invalid.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts — please wait a moment and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  };
  return map[code] || err.message || 'Something went wrong. Please try again.';
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
