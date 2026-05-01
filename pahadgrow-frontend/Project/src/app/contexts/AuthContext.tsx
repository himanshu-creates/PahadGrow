import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'landowner' | 'admin';
  phone: string;
  village: string;
  district: string;
  state: string;
  avatar: string;
  joinedDate: string;
  bio: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoggedIn: false,
  isAdmin: false,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('pg_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem('pg_token');
  });

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem('pg_user', JSON.stringify(u));
    else localStorage.removeItem('pg_user');
  };

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem('pg_token', t);
    else localStorage.removeItem('pg_token');
  };

  const logout = () => {
    setUserState(null);
    setTokenState(null);
    localStorage.removeItem('pg_token');
    localStorage.removeItem('pg_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: !!user && !!token,
      isAdmin: user?.role === 'admin',
      setUser,
      setToken,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}