'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  phone: string;
  remaining?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshBalance: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (idToken: string) => {
    console.log('[Auth] Calling /api/auth/verify...');
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    console.log('[Auth] Verify response:', res.status, data);
    if (data.user) {
      setUser(data.user);
      console.log('[Auth] User set:', data.user);
    } else {
      console.error('[Auth] Verify failed:', data);
      throw new Error(data.error || 'verify_failed');
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const d = await res.json();
      if (d.user) setUser(d.user);
    } catch { /* ignore */ }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  );
}
