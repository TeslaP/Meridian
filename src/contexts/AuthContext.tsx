import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  username: string | null;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Hardcoded credentials for MVP
const VALID_CREDENTIALS = {
  username: 'inspector',
  password: 'meridian2024'
};

const getLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`Failed to access localStorage for key ${key}:`, err);
    return null;
  }
};

const setLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Failed to set localStorage for key ${key}:`, err);
  }
};

const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Failed to remove localStorage for key ${key}:`, err);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = getLocalStorage('isAuthenticated');
    return saved === 'true';
  });
  const [username, setUsername] = useState<string | null>(() => {
    return getLocalStorage('username');
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debug authentication state
    console.log('Auth State:', { isAuthenticated, username, error });
  }, [isAuthenticated, username, error]);

  const login = (username: string, password: string): boolean => {
    try {
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        setIsAuthenticated(true);
        setUsername(username);
        setLocalStorage('isAuthenticated', 'true');
        setLocalStorage('username', username);
        setError(null);
        return true;
      }
      setError('Invalid credentials');
      return false;
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      return false;
    }
  };

  const logout = () => {
    try {
      setIsAuthenticated(false);
      setUsername(null);
      removeLocalStorage('isAuthenticated');
      removeLocalStorage('username');
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('An error occurred during logout');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, username, error }}>
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