'use client';

/**
 * 后端 API 客户端
 *
 * - 自动带上 accessToken
 * - accessToken 过期(401)时用 refreshToken 静默刷新一次后重试
 * - 统一解包 { code, data, message }
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const ACCESS_KEY = 'hgbord_access';
const REFRESH_KEY = 'hgbord_refresh';

export const tokenStore = {
  get access() {
    return typeof window === 'undefined' ? null : localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(public code: string | number, message: string, public status: number) {
    super(message);
  }
}

async function doFetch(path: string, init: RequestInit = {}, withAuth = true): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) };
  if (withAuth && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;

  const res = await fetch(`${API_URL}/api${path}`, { ...init, headers });
  const json = await res.json().catch(() => ({ code: 'PARSE_ERROR', data: null, message: '响应解析失败' }));

  // 401 → 尝试刷新一次
  if (res.status === 401 && withAuth && tokenStore.refresh) {
    const refreshed = await tryRefresh();
    if (refreshed) return doFetch(path, init, withAuth);
    tokenStore.clear();
    throw new ApiError('UNAUTHORIZED', '登录已过期', 401);
  }

  if (!res.ok || (json.code !== 0 && json.code !== 'ok')) {
    throw new ApiError(json.code ?? res.status, json.message ?? '请求失败', res.status);
  }
  return json.data;
}

let refreshPromise: Promise<boolean> | null = null;
async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokenStore.refresh }),
      });
      const json = await res.json();
      if (res.ok && json.code === 0 && json.data?.accessToken) {
        tokenStore.set(json.data.accessToken, json.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export const api = {
  get: (path: string) => doFetch(path),
  post: (path: string, body?: unknown) => doFetch(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: (path: string, body?: unknown) => doFetch(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: (path: string) => doFetch(path, { method: 'DELETE' }),
  auth: {
    login: (phone: string, password: string) =>
      doFetch('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }, false) as Promise<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      }>,
    me: () => doFetch('/auth/me') as Promise<UserVo>,
    logout: () => api.post('/auth/logout'),
  },
  users: {
    list: (params: Record<string, unknown>) =>
      api.get(`/users?${new URLSearchParams(params as Record<string, string>).toString()}`) as Promise<Paginated<UserVo>>,
    create: (data: Record<string, unknown>) => api.post('/users', data) as Promise<UserVo>,
    update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data) as Promise<UserVo>,
    updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }) as Promise<UserVo>,
    updateStatus: (id: string, status: string) => api.patch(`/users/${id}/status`, { status }) as Promise<UserVo>,
    remove: (id: string) => api.delete(`/users/${id}`) as Promise<{ success: boolean }>,
  },
  forms: {
    list: (params: Record<string, unknown> = {}) =>
      api.get(`/forms?${new URLSearchParams(params as Record<string, string>).toString()}`) as Promise<Paginated<FormVo>>,
    getById: (id: string) => api.get(`/forms/${id}`) as Promise<FormVo>,
    listSubmissions: (formId: string, params: Record<string, unknown> = {}) =>
      api.get(`/forms/${formId}/submissions?${new URLSearchParams(params as Record<string, string>).toString()}`) as Promise<Paginated<FormSubmissionVo>>,
    updateSubmission: (formId: string, sid: string, data: Record<string, unknown>) =>
      api.patch(`/forms/${formId}/submissions/${sid}`, { data }) as Promise<FormSubmissionVo>,
    deleteSubmission: (formId: string, sid: string) =>
      api.delete(`/forms/${formId}/submissions/${sid}`) as Promise<{ success: boolean }>,
    batchUpdate: (
      formId: string,
      payload: { created?: unknown[]; updated?: Array<{ id: string; data: unknown }>; deleted?: string[] },
    ) => api.post(`/forms/${formId}/submissions/batch`, payload) as Promise<{ success: boolean; created: number; updated: number; deleted: number }>,
    getPublic: (id: string) => api.get(`/forms/public/${id}`) as Promise<FormVo>,
    submitPublic: (id: string, data: Record<string, unknown>) =>
      doFetch(`/forms/public/${id}/submit`, { method: 'POST', body: JSON.stringify({ data }) }, false) as Promise<FormSubmissionVo>,
  },
};

import type { UserVo, FormVo, FormSubmissionVo } from '@hgbord/shared';
import type { AuthUser } from './auth-context';
type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; totalPages: number };
