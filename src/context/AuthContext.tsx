import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { apiFetch, setAccessToken, ApiError } from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  theme: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session via refresh cookie.
  // Uses raw fetch (not apiFetch) to avoid the 401-retry loop.
  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api';
    fetch(`${base}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('No session');
        return res.json() as Promise<{ accessToken: string; user: AuthUser }>;
      })
      .then(({ accessToken, user: u }) => {
        setAccessToken(accessToken);
        setUser(u);
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: u } = await apiFetch<{ accessToken: string; user: AuthUser }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    );
    setAccessToken(accessToken);
    setUser(u);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const { accessToken, user: u } = await apiFetch<{ accessToken: string; user: AuthUser }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify({ email, password, displayName }) },
      );
      setAccessToken(accessToken);
      setUser(u);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore errors on logout — clear state regardless
      if (!(err instanceof ApiError)) throw err;
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  return (
    <Ctx.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
