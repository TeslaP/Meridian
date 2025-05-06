import React, { useState } from 'react';
import { passengers as initialPassengers } from './data/passengers';
import { ChatWindow } from './components/ChatWindow';
import { CharacterSlider } from './components/CharacterSlider';
import { useAuth } from './contexts/AuthContext';
import LoginWindow from './components/LoginWindow';
import { Passenger } from './data/passengers';

interface Associate {
  name: string;
  relationship: string;
  details: string;
}

interface BiographyUpdate {
  section: string;
  content: string;
}

interface CharacterRevelations {
  newAssociates?: Associate[];
  biographyUpdates?: BiographyUpdate[];
}

interface GPTResponse {
  response: string;
  trustChange: number;
  revelations?: CharacterRevelations;
}

export const App: React.FC = () => {
  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [selectedPassenger, setSelectedPassenger] = useState(passengers[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const handleError = (error: string) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
  };

  const resetGame = () => {
    // Reset all passengers to initial state
    const resetPassengers = initialPassengers.map(passenger => ({
      ...passenger,
      artifacts: passenger.artifacts.map(artifact => ({
        ...artifact,
        discovered: false
      }))
    }));
    setPassengers(resetPassengers);
    setSelectedPassenger(resetPassengers[0]);
  };

  const handleItemDiscovery = (passengerId: string, itemId: string) => {
    setPassengers(prevPassengers => 
      prevPassengers.map(passenger => {
        if (passenger.id === passengerId) {
          return {
            ...passenger,
            artifacts: passenger.artifacts.map(artifact => ({
              ...artifact,
              discovered: artifact.id === itemId || artifact.discovered
            }))
          };
        }
        return passenger;
      })
    );
  };

  const handleTrustChange = (passengerId: string, change: number) => {
    setPassengers(prevPassengers =>
      prevPassengers.map(passenger => {
        if (passenger.id === passengerId) {
          const newTrustLevel = Math.max(0, Math.min(100, passenger.trustLevel + change));
          return {
            ...passenger,
            trustLevel: newTrustLevel
          };
        }
        return passenger;
      })
    );
  };

  const handleChatResponse = async (response: GPTResponse) => {
    if (response.revelations) {
      const { newAssociates, biographyUpdates } = response.revelations;
      
      if (newAssociates && newAssociates.length > 0) {
        setPassengers(prevPassengers => 
          prevPassengers.map(p => {
            if (p.id === selectedPassenger?.id) {
              return {
                ...p,
                knownAssociates: [
                  ...p.knownAssociates,
                  ...newAssociates.filter(newAssociate => 
                    !p.knownAssociates.some(existing => 
                      existing.name === newAssociate.name
                    )
                  )
                ]
              };
            }
            return p;
          })
        );
      }

      if (biographyUpdates && biographyUpdates.length > 0) {
        setPassengers(prevPassengers =>
          prevPassengers.map(p => {
            if (p.id === selectedPassenger?.id) {
              const updates = biographyUpdates.reduce((acc: any, update: BiographyUpdate) => {
                switch (update.section) {
                  case 'background':
                    return { ...acc, background: `${p.background}\n\n${update.content}` };
                  case 'description':
                    return { ...acc, description: `${p.description}\n\n${update.content}` };
                  case 'secrets':
                    return { ...acc, secrets: [...p.secrets, update.content] };
                  default:
                    return acc;
                }
              }, {});
              return { ...p, ...updates };
            }
            return p;
          })
        );
      }
    }
  };

  if (!user) {
    return <LoginWindow />;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e2e0dc]">
      <header className="bg-[#2a2a2a] p-4 border-b border-[#2a2a2a]">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-['Playfair_Display']">Meridian Interrogation System</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-[#e2e0dc]/70">Inspector {user.username}</span>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-[#e2e0dc]/10 text-[#e2e0dc] rounded-lg hover:bg-[#e2e0dc]/20"
            >
              Start
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-[#e2e0dc]/10 text-[#e2e0dc] rounded-lg hover:bg-[#e2e0dc]/20"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="fixed top-4 right-4 bg-red-900/90 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[500px,1fr,300px] gap-4">
          {/* Dialogue Panel */}
          <div className="bg-[#2a2a2a] rounded-lg p-4 h-[calc(100vh-8rem)]">
            <ChatWindow
              passenger={selectedPassenger}
              onTrustChange={handleTrustChange}
              onItemDiscovery={handleItemDiscovery}
              onChatResponse={handleChatResponse}
              isLoading={isLoading}
              onError={handleError}
            />
          </div>

          {/* Character Info Panel */}
          <div className="bg-[#2a2a2a] rounded-lg p-4 h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="sticky top-4">
              <h2 className="text-xl font-['Playfair_Display'] mb-4">Active Investigation</h2>
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{selectedPassenger.name}</h3>
                      <p className="text-sm text-[#e2e0dc]/70">{selectedPassenger.title}</p>
                    </div>
                    <div className="text-xs text-[#e2e0dc]/50">
                      ID: {selectedPassenger.id}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-sm">Trust Level:</div>
                      <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-600/50 transition-all duration-300"
                          style={{ width: `${selectedPassenger.trustLevel}%` }}
                        />
                      </div>
                      <div className="text-sm">{selectedPassenger.trustLevel}%</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Background</h4>
                      <p className="text-sm text-[#e2e0dc]/80 leading-relaxed">
                        {selectedPassenger.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Items</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPassenger.artifacts
                          .filter(artifact => artifact.discovered)
                          .map(artifact => (
                            <div 
                              key={artifact.id}
                              className="px-3 py-2 bg-[#2a2a2a] text-[#e2e0dc]/70 rounded-lg"
                            >
                              <div className="font-medium text-sm">{artifact.name}</div>
                              <div className="text-xs text-[#e2e0dc]/50 mt-1">
                                {artifact.description}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Known Associates</h4>
                      <div className="space-y-2">
                        {selectedPassenger.knownAssociates.map((associate, index) => (
                          <div 
                            key={index}
                            className="px-3 py-2 bg-[#2a2a2a] text-[#e2e0dc]/70 rounded-lg"
                          >
                            <div className="font-medium text-sm">{associate.name}</div>
                            <div className="text-xs text-[#e2e0dc]/50">{associate.relationship}</div>
                            <div className="text-xs text-[#e2e0dc]/50 mt-1">{associate.details}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger List Panel */}
          <div className="bg-[#2a2a2a] rounded-lg p-4 h-[calc(100vh-8rem)] overflow-y-auto">
            <h2 className="text-xl font-['Playfair_Display'] mb-4">Passengers</h2>
            <div className="space-y-2">
              {passengers.map(passenger => (
                <div
                  key={passenger.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPassenger.id === passenger.id
                      ? 'bg-[#e2e0dc]/10'
                      : 'bg-[#1a1a1a] hover:bg-[#e2e0dc]/5'
                  }`}
                  onClick={() => setSelectedPassenger(passenger)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{passenger.name}</h3>
                      <p className="text-sm text-[#e2e0dc]/70">{passenger.title}</p>
                    </div>
                    <div className="text-xs text-[#e2e0dc]/50">
                      {passenger.trustLevel}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 