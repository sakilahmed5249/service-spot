import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { customerAPI, providerAPI } from '../services/api';

/*
  AuthContext:
  - Robust initialization (refresh profile if possible)
  - Cross-tab sync via 'storage' events
  - login/signup/logout/updateUser utilities
  - Tries to set Authorization header on provided API instances if supported
*/

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  EVENT: 'ss_auth_event', // used to broadcast login/logout across tabs
};

// Helper: attempt to set auth header on api instances (if they expose setAuthToken or axios instance)
function setAuthTokenOnApis(token) {
  if (!token) {
    // attempt to remove header
    [customerAPI, providerAPI].forEach((api) => {
      if (!api) return;
      if (typeof api.setAuthToken === 'function') {
        api.setAuthToken(null);
      } else if (api?.defaults?.headers?.common) {
        delete api.defaults.headers.common.Authorization;
      }
    });
    return;
  }

  const header = `Bearer ${token}`;
  [customerAPI, providerAPI].forEach((api) => {
    if (!api) return;
    if (typeof api.setAuthToken === 'function') {
      api.setAuthToken(token);
    } else if (api?.defaults?.headers?.common) {
      api.defaults.headers.common.Authorization = header;
    }
  });
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);           // user object or null
  const [loading, setLoading] = useState(true);     // while auth state resolving or login/logout in-flight
  const [error, setError] = useState(null);
  const initializingRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Read persisted token/user on mount and optionally refresh profile
  useEffect(() => {
    let mounted = true;
    abortControllerRef.current = new AbortController();

    async function init() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (token) {
          // Apply token to API clients (best-effort)
          setAuthTokenOnApis(token);

          // Try to fetch fresh profile if APIs provide a "me" endpoint
          // Prefer provider/customer depending on stored user role, fallback both
          let parsedUser = null;
          try {
            parsedUser = storedUser ? JSON.parse(storedUser) : null;
          } catch (e) {
            parsedUser = null;
          }

          const sig = abortControllerRef.current.signal;
          // try providerAPI.me then customerAPI.me depending on role, then fallback to whichever works
          let freshUser = null;
          if (parsedUser?.role === 'provider' && providerAPI?.me) {
            const r = await providerAPI.me({ signal: sig }).catch(() => null);
            freshUser = r?.data ?? null;
          } else if (parsedUser?.role === 'customer' && customerAPI?.me) {
            const r = await customerAPI.me({ signal: sig }).catch(() => null);
            freshUser = r?.data ?? null;
          } else {
            // try both endpoints (best-effort)
            if (providerAPI?.me) {
              const r = await providerAPI.me({ signal: sig }).catch(() => null);
              freshUser = r?.data ?? null;
            }
            if (!freshUser && customerAPI?.me) {
              const r = await customerAPI.me({ signal: sig }).catch(() => null);
              freshUser = r?.data ?? null;
            }
          }

          if (freshUser && mounted) {
            // ensure role preserved or inferred
            if (!freshUser.role && parsedUser?.role) freshUser.role = parsedUser.role;
            setUser(freshUser);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
          } else if (parsedUser && mounted) {
            setUser(parsedUser);
          } else if (mounted) {
            // no usable user found -> clear token & user
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            setAuthTokenOnApis(null);
            setUser(null);
          }
        } else {
          // no token
          setUser(null);
        }
      } catch (err) {
        // ignore aborts, surface other errors
        if (err.name !== 'AbortError') {
          console.error('Auth init error', err);
          setError(err);
        }
        setUser(null);
        setAuthTokenOnApis(null);
      } finally {
        if (mounted) {
          setLoading(false);
          initializingRef.current = false;
        }
      }
    }

    init();

    // cross-tab sync: listen for storage events
    function onStorage(e) {
      if (e.key === STORAGE_KEYS.EVENT) {
        // event value may be 'logout' or 'login'
        try {
          const payload = JSON.parse(e.newValue);
          if (payload?.type === 'logout') {
            // clear local state
            setUser(null);
            setAuthTokenOnApis(null);
          } else if (payload?.type === 'login' && payload?.user) {
            setUser(payload.user);
            if (payload?.token) setAuthTokenOnApis(payload.token);
          }
        } catch {
          // ignore malformed
        }
      } else if (e.key === STORAGE_KEYS.TOKEN && e.newValue === null) {
        // token removed in other tab -> force logout locally
        setUser(null);
        setAuthTokenOnApis(null);
      } else if (e.key === STORAGE_KEYS.USER) {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    }
    window.addEventListener('storage', onStorage);

    return () => {
      mounted = false;
      abortControllerRef.current?.abort();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Login helper: returns { success, user?, token?, error? }
  const login = useCallback(async (credentials, userType = 'customer') => {
    setLoading(true);
    setError(null);
    try {
      let response = null;

      if (userType === 'customer') {
        if (!customerAPI?.login) throw new Error('customerAPI.login not implemented');
        response = await customerAPI.login(credentials);
      } else {
        if (!providerAPI?.login) throw new Error('providerAPI.login not implemented');
        // provider login expects same credentials shape
        response = await providerAPI.login(credentials);
      }

      const data = response?.data ?? response;
      // prefer token + user from API but support older shapes
      const token = data?.token ?? data?.accessToken ?? btoa(JSON.stringify({ id: data?.id ?? Date.now() }));
      const userFromApi = data?.user ?? (data?.profile ?? data) ?? null;

      const finalUser = userFromApi ? { ...userFromApi, role: userType } : { ...credentials, role: userType };

      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(finalUser));
      setAuthTokenOnApis(token);
      setUser(finalUser);

      // broadcast to other tabs
      try {
        localStorage.setItem(STORAGE_KEYS.EVENT, JSON.stringify({ type: 'login', token, user: finalUser, ts: Date.now() }));
      } catch {}

      return { success: true, user: finalUser, token };
    } catch (err) {
      console.error('Login error', err);
      const message = err?.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup helper: returns { success, data?, error? }
  const signup = useCallback(async (userData, userType = 'customer', autoLogin = false) => {
    setLoading(true);
    setError(null);
    try {
      let response = null;

      if (userType === 'customer') {
        if (!customerAPI?.signup) throw new Error('customerAPI.signup not implemented');
        response = await customerAPI.signup(userData);
      } else {
        if (!providerAPI?.signup) throw new Error('providerAPI.signup not implemented');
        response = await providerAPI.signup(userData);
      }

      const data = response?.data ?? response;

      // Optionally auto-login using provided credentials (if backend supports)
      if (autoLogin) {
        // try to login automatically using credentials common fields
        const cred = { email: userData.email, password: userData.password };
        return await login(cred, userType);
      }

      return { success: true, data };
    } catch (err) {
      console.error('Signup error', err);
      const message = err?.response?.data?.message || err.message || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Logout helper (sync across tabs)
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // attempt to call logout API if provided (best-effort)
      try {
        if (customerAPI?.logout) await customerAPI.logout().catch(() => {});
        if (providerAPI?.logout) await providerAPI.logout().catch(() => {});
      } catch {
        // ignore
      }

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setAuthTokenOnApis(null);
      setUser(null);

      // broadcast to other tabs that we've logged out
      try {
        localStorage.setItem(STORAGE_KEYS.EVENT, JSON.stringify({ type: 'logout', ts: Date.now() }));
      } catch {}
      return { success: true };
    } catch (err) {
      console.error('Logout error', err);
      const message = err?.message || 'Logout failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user (merge + persist)
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...updatedData };
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    // convenience flags
    isAuthenticated: Boolean(user),
    isCustomer: user?.role === 'customer',
    isProvider: user?.role === 'provider',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};