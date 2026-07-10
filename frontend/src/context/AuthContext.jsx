// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.auth.login(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('halfcon_token', res.token);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, phone) => {
    setError(null);
    try {
      const res = await api.auth.register(name, email, password, phone);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('halfcon_token', res.token);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (idToken) => {
    setError(null);
    try {
      const res = await api.auth.google(idToken);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('halfcon_token', res.token);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('halfcon_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
