import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Hardcoded credentials for MVP
const VALID_CREDENTIALS = {
  username: 'inspector',
  password: 'meridian2024'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('username');
  });

  useEffect(() => {
    // Debug authentication state
    console.log('Auth State:', { isAuthenticated, username });
  }, [isAuthenticated, username]);

  const login = (username: string, password: string): boolean => {
    try {
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        setIsAuthenticated(true);
        setUsername(username);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    try {
      setIsAuthenticated(false);
      setUsername(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 