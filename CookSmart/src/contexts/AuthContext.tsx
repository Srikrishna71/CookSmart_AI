import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  dietaryPreferences: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until hydration attempt finishes

  // On mount: if a token exists in localStorage, verify it with the backend
  // and rehydrate the user. This handles page refreshes.
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    authApi
      .getMe()
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        // Token is expired or invalid — clear it silently
        localStorage.removeItem('authToken');
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // ─── login ────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<void> => {
    const res = await authApi.login(email, password);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  // ─── register ─────────────────────────────────────────────────────────────

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const res = await authApi.register(name, email, password);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  // ─── logout ───────────────────────────────────────────────────────────────

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
