import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';

const LoginWindow: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e2e0dc] flex items-center justify-center">
      <div className="bg-[#2a2a2a] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-['Playfair_Display'] mb-6 text-center">
          Meridian Interrogation System
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-[#1a1a1a] text-[#e2e0dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e2e0dc]/20"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#1a1a1a] text-[#e2e0dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e2e0dc]/20"
              required
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#e2e0dc]/10 text-[#e2e0dc] rounded-lg hover:bg-[#e2e0dc]/20"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginWindow; 