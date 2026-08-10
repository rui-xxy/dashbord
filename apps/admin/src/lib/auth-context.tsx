'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { hasPermission, type Permission, type Role } from '@hgbord/shared';
import { api, tokenStore } from './api';

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  role: Role;
  status: string;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** 判断当前用户是否有某权限（前端体验用，真实校验在后端） */
  can: (perm: Permission) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动时若有 token，尝试恢复会话
  useEffect(() => {
    if (!tokenStore.access) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then((u) => setUser({ id: u.id, phone: u.phone, name: u.name, role: u.role, status: u.status }))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const res = await api.auth.login(phone, password);
    tokenStore.set(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const can = useCallback((perm: Permission) => (user ? hasPermission(user.role, perm) : false), [user]);

  return <Ctx.Provider value={{ user, loading, login, logout, can }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
