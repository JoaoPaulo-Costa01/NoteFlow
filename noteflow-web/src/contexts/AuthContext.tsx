import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextData {
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (token: string) => void;
  logout:          () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]       = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('noteflow_token');
    if (stored) setToken(stored);
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('noteflow_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('noteflow_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);