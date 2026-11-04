// context/AuthContext.jsx
//
// Supabase Auth is the single source of truth for identity.
// onAuthStateChange listens for sign-in, sign-out, and silent token
// refreshes. We synchronize the user's role and database profile from
// /api/auth/me while supporting unverified email alerts, password resets,
// and OAuth flows. (Migrated from Firebase Auth in Migration M3 — the
// public surface of this context is unchanged.)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  // Sync profile with backend
  const syncProfile = useCallback(async (sbUser) => {
    if (!sbUser) {
      setUser(null);
      setAuthUser(null);
      setIsEmailVerified(false);
      return;
    }

    setAuthUser(sbUser);
    const verified = Boolean(sbUser.email_confirmed_at);
    setIsEmailVerified(verified);

    try {
      const res = await api.auth.getMe();
      if (res?.user) {
        setUser({
          ...res.user,
          email_verified: verified,
          photoURL: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || null,
        });
      } else {
        throw new Error('No user data returned');
      }
    } catch (err) {
      // Fallback profile if the API is initializing or offline
      const meta = sbUser.user_metadata || {};
      setUser({
        id: sbUser.id,
        name: meta.full_name || meta.name || (sbUser.email ? sbUser.email.split('@')[0] : 'User'),
        email: sbUser.email,
        role: 'customer',
        email_verified: verified,
        photoURL: meta.avatar_url || meta.picture || null,
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      try {
        await syncProfile(data.session?.user || null);
      } catch (err) {
        console.error('Failed to sync auth state:', err);
      } finally {
        if (active) setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      try {
        await syncProfile(session?.user || null);
      } catch (err) {
        console.error('Failed to sync auth state:', err);
      } finally {
        setLoading(false);
      }
    });
    return () => {
      active = false;
      subscription?.subscription?.unsubscribe();
    };
  }, [syncProfile]);

  const oauthLogin = async (provider) => {
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + '/' },
      });
      if (oauthError) throw oauthError;
      // The browser now redirects to the provider; on return,
      // onAuthStateChange syncs the profile.
      return null;
    } catch (err) {
      const msg = friendlyAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = () => oauthLogin('google');
  const loginWithFacebook = () => oauthLogin('facebook');

  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      await syncProfile(data.user);
      return data.user;
    } catch (err) {
      const msg = friendlyAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name?.trim() || undefined } },
      });
      if (signUpError) throw signUpError;
      // Supabase sends the confirmation email itself when email
      // confirmation is enabled. If a session exists (confirmation
      // disabled), sync the profile right away.
      if (data.user && data.session) {
        await syncProfile(data.user);
      }
      return { user: data.user, email: email.trim() };
    } catch (err) {
      const msg = friendlyAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const sendPasswordReset = async (email) => {
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/login',
      });
      if (resetError) throw resetError;
      return true;
    } catch (err) {
      const msg = friendlyAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const updatePassword = async (newPassword) => {
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setPasswordRecovery(false);
      return true;
    } catch (err) {
      const msg = friendlyAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const resendVerificationEmail = async () => {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email;
    if (!email) {
      throw new Error('You must be signed in to request a verification email.');
    }
    try {
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
      if (resendError) throw resendError;
      return true;
    } catch (err) {
      const msg = friendlyAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const reloadUser = async () => {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) return null;
    try {
      await syncProfile(data.user);
      return data.user;
    } catch (err) {
      console.error('Failed to reload user profile:', err);
      return null;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAuthUser(null);
      setIsEmailVerified(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        firebaseUser: authUser, // legacy alias — older pages destructure this name
        loading,
        error,
        setError,
        isEmailVerified,
        passwordRecovery,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        sendPasswordReset,
        updatePassword,
        resendVerificationEmail,
        reloadUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function friendlyAuthError(err) {
  if (!err) return 'An unknown error occurred.';
  const message = err.message || '';

  if (/already registered|already exists/i.test(message)) {
    return 'An account with this email address already exists. Please log in.';
  }
  if (/invalid login credentials/i.test(message)) {
    return 'Incorrect email or password. Please verify your details.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Please verify your email address first — check your inbox for the confirmation link.';
  }
  if (/password should be at least/i.test(message)) {
    return 'Password must be at least 6 characters.';
  }
  if (/invalid email|unable to validate email/i.test(message)) {
    return 'Please enter a valid email address.';
  }
  if (/rate limit|too many/i.test(message)) {
    return 'Too many unsuccessful attempts. Please wait a moment or reset your password.';
  }
  if (/network|failed to fetch/i.test(message)) {
    return 'Network connection failed. Please check your internet connection.';
  }
  if (/provider is not enabled/i.test(message)) {
    return 'This sign-in method is not enabled yet. Please use email and password, or contact support.';
  }
  if (/user.*disabled|banned/i.test(message)) {
    return 'This account has been disabled. Please contact support.';
  }

  return message || 'Something went wrong. Please try again.';
}

// Backwards-compatible alias (the old Firebase-era name).
export const friendlyFirebaseError = friendlyAuthError;

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
