import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginWindow: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, error: authError } = useAuth();

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!username || !password) {
      setLocalError('Please enter both username and password');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setLocalError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meridian Inspection System</h1>
          <p className="text-gray-400">Please log in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {localError && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
              {localError}
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginWindow; 