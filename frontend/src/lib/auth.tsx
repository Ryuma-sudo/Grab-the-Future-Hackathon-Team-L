'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser } from './api';
import type { ApiUser, LoginPayload, RegisterPayload } from './api';

interface AuthContextValue {
  user: ApiUser | null;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<ApiUser>;
  register: (payload: RegisterPayload) => Promise<ApiUser>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'grab_future_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as ApiUser);
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);

  const persistUser = useCallback((nextUser: ApiUser) => {
    setUser(nextUser);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginUser(payload);
      persistUser(response.user);
      return response.user;
    },
    [persistUser]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const createdUser = await registerUser(payload);
      const response = await loginUser({ email: payload.email, password: payload.password });
      persistUser(response.user || createdUser);
      return response.user || createdUser;
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, register, logout }),
    [user, isReady, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
