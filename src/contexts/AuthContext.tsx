/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { User, Role, LoginResponse } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function initAuth(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('auth_user');
    if (token && userRaw) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        return { user: null, token: null };
      }
      return { user: JSON.parse(userRaw), token };
    }
  } catch {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(() => initAuth());
  const [loading] = useState(false);

  const storeAuth = useCallback((data: LoginResponse) => {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setAuth({ user: data.user, token: data.token });
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuth({ user: null, token: null });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<LoginResponse>('/auth/login', { email, password });
    storeAuth(data);
  }, [storeAuth]);

  const register = useCallback(async (email: string, password: string, fullName: string, role?: string) => {
    const data = await api.post<LoginResponse>('/auth/register', { email, password, fullName, role });
    storeAuth(data);
  }, [storeAuth]);

  const logout = useCallback(() => {
    clearAuth();
    window.location.href = '/login';
  }, [clearAuth]);

  const hasRole = useCallback((...roles: Role[]) => {
    return auth.user !== null && roles.includes(auth.user.role);
  }, [auth.user]);

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!auth.user && auth.user.status === 'active',
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
