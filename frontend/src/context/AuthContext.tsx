'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  savedIds: string[];
  toggleSave: (collegeId: string) => Promise<void>;
  refreshSaved: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) refreshSaved();
    else setSavedIds([]);
  }, [token]);

  const login = (t: string, u: User) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setSavedIds([]);
  };

  const refreshSaved = async () => {
    const t = localStorage.getItem('token');
    if (!t) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/saved-ids`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedIds(data.ids);
      }
    } catch {}
  };

  const toggleSave = async (collegeId: string) => {
    if (!token) return;
    const isSaved = savedIds.includes(collegeId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/colleges/${collegeId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSavedIds((prev) =>
          isSaved ? prev.filter((id) => id !== collegeId) : [...prev, collegeId]
        );
      }
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, savedIds, toggleSave, refreshSaved }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
