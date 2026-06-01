import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthState {
  token: string | null;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  setSession: (token: string, username: string) => void;
  clear: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
  }));

  const setSession = (token: string, username: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setState({ token, username });
  };

  const clear = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setState({ token: null, username: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, setSession, clear }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
