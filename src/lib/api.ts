import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { ApiError, ApiMeta, ApiSuccess } from '@/types/api';

const ACCESS_KEY = 'promoo.access';
const REFRESH_KEY = 'promoo.refresh';

export const tokenStore = {
  access: () => localStorage.getItem(ACCESS_KEY),
  refresh: () => localStorage.getItem(REFRESH_KEY),
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.access();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refresh = tokenStore.refresh();
  if (!refresh) return null;
  try {
    const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refresh });
    const session = res.data?.data?.session ?? res.data?.data;
    const access = session?.access_token;
    const newRefresh = session?.refresh_token ?? refresh;
    if (access) {
      tokenStore.set(access, newRefresh);
      return access;
    }
    return null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;

    if (status === 401 && original && !original._retried) {
      original._retried = true;
      refreshing = refreshing ?? doRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
      }
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  },
);

/** Pull a human-readable message out of any backend/axios error. */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    return data?.message || err.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

/** Unwrap a single-object envelope. */
export async function getData<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<ApiSuccess<T>>(url, config);
  return res.data.data;
}

/** Unwrap a paginated/list envelope, returning rows + meta. */
export async function getList<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<{ rows: T[]; meta: ApiMeta }> {
  const res = await api.get<ApiSuccess<T[]>>(url, config);
  const meta = res.data.meta ?? {
    page: 1,
    limit: res.data.data?.length ?? 0,
    total: res.data.data?.length ?? 0,
    totalPages: 1,
  };
  return { rows: res.data.data ?? [], meta };
}
