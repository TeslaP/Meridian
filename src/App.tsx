import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChatWindow } from './components/ChatWindow';
import { PassengerDossier } from './components/PassengerDossier';
import LoginWindow from './components/LoginWindow';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { passengers } from './data/passengers';
import './styles/main.css';

const MainApp: React.FC = () => {
  const [currentPassenger, setCurrentPassenger] = useState(passengers[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, username, logout } = useAuth();

  useEffect(() => {
    // Debug environment variables
    console.log('Environment:', process.env.NODE_ENV);
    console.log('VITE_APP_ENV:', process.env.VITE_APP_ENV);
  }, []);

  const handleInspect = (passengerId: string) => {
    try {
      const passenger = passengers.find(p => p.id === passengerId);
      if (passenger) {
        setCurrentPassenger(passenger);
      } else {
        console.error('Passenger not found:', passengerId);
        setError('Passenger not found');
      }
    } catch (err) {
      console.error('Error inspecting passenger:', err);
      setError('Error inspecting passenger');
    }
  };

  if (!isAuthenticated) {
    return <LoginWindow />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meridian Inspection System</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Inspector: {username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {passengers.map(passenger => (
              <PassengerDossier
                key={passenger.id}
                passenger={passenger}
                onInspect={() => handleInspect(passenger.id)}
              />
            ))}
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <ChatWindow
              passenger={currentPassenger}
              isLoading={isLoading}
              onError={setError}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 