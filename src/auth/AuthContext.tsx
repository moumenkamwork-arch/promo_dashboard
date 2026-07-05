import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore, getData } from '@/lib/api';
import type { LoginResponse, Profile } from '@/types/api';

interface AuthState {
  profile: Profile | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const PROFILE_KEY = 'promoo.profile';

export class NotAdminError extends Error {
  constructor() {
    super('not-admin');
    this.name = 'NotAdminError';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  });
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(PROFILE_KEY);
    setProfile(null);
  }, []);

  // Revalidate the stored session on boot.
  useEffect(() => {
    let active = true;
    async function boot() {
      if (!tokenStore.access()) {
        setReady(true);
        return;
      }
      try {
        const me = await getData<Profile>('/profiles/me');
        if (!active) return;
        if (!me.is_admin) {
          clearSession();
        } else {
          setProfile(me);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(me));
        }
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setReady(true);
      }
    }
    void boot();
    return () => {
      active = false;
    };
  }, [clearSession]);

  // React to forced logout from the api interceptor.
  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ data: LoginResponse }>('/auth/login/email', { email, password });
    const payload = res.data.data;
    const session = payload.session;
    if (!session?.access_token) throw new Error('No session returned');
    tokenStore.set(session.access_token, session.refresh_token);

    let me = payload.profile ?? null;
    if (!me) me = await getData<Profile>('/profiles/me');
    if (!me?.is_admin) {
      clearSession();
      throw new NotAdminError();
    }
    setProfile(me);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(me));
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore network errors on logout */
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthState>(() => ({ profile, ready, login, logout }), [profile, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
