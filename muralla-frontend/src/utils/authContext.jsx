import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:8081/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('muralla_token');
    const storedUser  = localStorage.getItem('muralla_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ── Email/password login ──────────────────────────
  const login = async (email, password) => {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.message || 'Credenciales incorrectas');
    }
    const data = await resp.json();
    persist(data);
    // Existing users skip the preferences wizard
    localStorage.setItem('muralla_prefs_done', '1');
    return data;
  };

  // ── Email/password register ───────────────────────
  const register = async (payload) => {
    const resp = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear la cuenta');
    }
    const data = await resp.json();
    persist(data);
    // New user: wizard not done yet
    localStorage.removeItem('muralla_prefs_done');
    return data;
  };

  // ── OAuth2 callback (Google) ──────────────────────
  const persistOAuth = ({ token, email, fullName }) => {
    persist({ token, email, fullName });
    // Don't mark prefs_done — OAuth2CallbackPage decides that
  };

  // ── Update preferences ────────────────────────────
  const savePreferences = async (preferences) => {
    const resp = await fetch(`${API_BASE}/users/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });
    if (!resp.ok) throw new Error('Error guardando preferencias');
    // Mark wizard as done so future logins redirect to /editor
    localStorage.setItem('muralla_prefs_done', '1');
    return resp.json();
  };

  // ── Logout ────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('muralla_token');
    localStorage.removeItem('muralla_user');
    localStorage.removeItem('muralla_prefs_done');
    setToken(null);
    setUser(null);
  };

  // ── Internal persist ──────────────────────────────
  const persist = (data) => {
    localStorage.setItem('muralla_token', data.token);
    localStorage.setItem('muralla_user', JSON.stringify({
      email: data.email,
      fullName: data.fullName,
    }));
    setToken(data.token);
    setUser({ email: data.email, fullName: data.fullName });
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, persistOAuth, savePreferences, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
