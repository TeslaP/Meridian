import React, { useState } from 'react';
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

  const handleInspect = (passengerId: string) => {
    const passenger = passengers.find(p => p.id === passengerId);
    if (passenger) {
      setCurrentPassenger(passenger);
    }
  };

  if (!isAuthenticated) {
    return <LoginWindow />;
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