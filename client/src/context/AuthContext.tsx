import { createContext, useState, useEffect, ReactNode } from 'react';
import type { AuthUser } from '../types';
import { fetchMe } from '../services/api';

interface AuthCtx {
  token: string | null;
  user: AuthUser | null;
  setToken: (t: string | null) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthCtx>({
  token: null,
  user: null,
  setToken: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('bm_token'));
  const [user, setUser]        = useState<AuthUser | null>(null);
  const [loading, setLoading]  = useState(true);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem('bm_token', t);
    else { localStorage.removeItem('bm_token'); setUser(null); }
    setTokenState(t);
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchMe()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
