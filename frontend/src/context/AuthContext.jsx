// context/AuthContext.jsx
//
// All sign-in now goes through Firebase Auth (Google, Facebook, and
// email/password). After Firebase confirms the identity, we hand its ID
// token to our backend, which verifies it and gives us back our own session
// cookie — that cookie (not the Firebase token) is what every other API call
// in this app relies on. See backend/src/routes/auth.js for that half.
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
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
  const [token, setToken] = useState(localStorage.getItem('halfcon_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      api.auth.getMe()
        .then((res) => setUser(res.user))
        .catch(() => {
          setToken(null);
          localStorage.removeItem('halfcon_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // Shared by every sign-in method below: once Firebase confirms who the
  // person is, exchange that for our backend session.
  const exchangeFirebaseUser = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    const res = await api.auth.firebaseSession(idToken);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('halfcon_token', res.token);
    return res;
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await exchangeFirebaseUser(result.user);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithFacebook = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return await exchangeFirebaseUser(result.user);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return await exchangeFirebaseUser(result.user);
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
      // Firebase requires email verification before our backend will accept
      // the token's email as trusted (see firebase-session route) — send it
      // automatically so the person just needs to click the link.
      await sendEmailVerification(result.user);
      return { verificationSent: true, email };
    } catch (err) {
      setError(friendlyFirebaseError(err));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Backend logout error:', err);
    }
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Firebase logout error:', err);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('halfcon_token');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, loginWithGoogle, loginWithFacebook, logout }}
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
