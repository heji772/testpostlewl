import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearAuthTokens, setAuthTokens, setUnauthorizedHandler } from '../utils/api';

const AuthContext = createContext();

const ACCESS_KEY = 'pg.accessToken';
const REFRESH_KEY = 'pg.refreshToken';
const USER_KEY = 'pg.user';
const PENDING_KEY = 'pg.pendingTotp';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_KEY));
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [pendingTotpToken, setPendingTotpToken] = useState(() => localStorage.getItem(PENDING_KEY));

  const persistTokens = useCallback((token, refresh, userData) => {
    setAccessToken(token);
    setAuthTokens(token, refresh);
    if (token) {
      localStorage.setItem(ACCESS_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_KEY);
    }

    setRefreshToken(refresh);
    if (refresh) {
      localStorage.setItem(REFRESH_KEY, refresh);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }

    if (userData) {
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      setUser(null);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const ensureUser = useCallback(async () => {
    if (user) {
      return user;
    }
    const { data } = await api.get('/auth/me');
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  }, [user]);

  const handleLogin = useCallback(async (credentials) => {
    setAuthLoading(true);
    try {
      const { data } = await api.post('/auth/login', credentials);
      if (data.requiresTotp || data.totpRequired) {
        const tempToken = data.tempToken || data.pendingToken || data.token;
        setPendingTotpToken(tempToken);
        if (tempToken) {
          localStorage.setItem(PENDING_KEY, tempToken);
        }
        return { requiresTotp: true };
      }

      persistTokens(data.token || data.accessToken, data.refreshToken, data.user);
      await ensureUser();
      localStorage.removeItem(PENDING_KEY);
      setPendingTotpToken(null);
      return { requiresTotp: false };
    } finally {
      setAuthLoading(false);
    }
  }, [ensureUser, persistTokens]);

  const verifyTotp = useCallback(async (code) => {
    if (!pendingTotpToken) {
      throw new Error('No pending multi-factor challenge');
    }
    setAuthLoading(true);
    try {
      const { data } = await api.post('/auth/totp/verify', { code, token: pendingTotpToken });
      persistTokens(data.token || data.accessToken, data.refreshToken, data.user);
      await ensureUser();
      localStorage.removeItem(PENDING_KEY);
      setPendingTotpToken(null);
    } finally {
      setAuthLoading(false);
    }
  }, [ensureUser, pendingTotpToken, persistTokens]);

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout call failed', error);
    }
    localStorage.removeItem(PENDING_KEY);
    setPendingTotpToken(null);
    persistTokens(null, null, null);
    clearAuthTokens();
  }, [persistTokens]);

  useEffect(() => {
    setAuthTokens(accessToken, refreshToken);
  }, [accessToken, refreshToken]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      handleLogout();
    });
  }, [handleLogout]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!accessToken) {
        setInitializing(false);
        return;
      }
      try {
        await ensureUser();
      } catch (error) {
        console.error('Session restore failed', error);
        await handleLogout();
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, [accessToken, ensureUser, handleLogout]);

  const value = useMemo(() => ({
    user,
    accessToken,
    refreshToken,
    initializing,
    authLoading,
    isAuthenticated: Boolean(accessToken && user),
    login: handleLogin,
    verifyTotp,
    logout: handleLogout,
    pendingTotpToken,
    setUser
  }), [
    user,
    accessToken,
    refreshToken,
    initializing,
    authLoading,
    handleLogin,
    verifyTotp,
    handleLogout,
    pendingTotpToken
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
