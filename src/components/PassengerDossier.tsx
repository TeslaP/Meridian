import React from 'react';
import { Passenger } from '../data/passengers.js';

interface PassengerDossierProps {
  passenger: Passenger;
  onInspect: () => void;
  isActive: boolean;
}

export const PassengerDossier: React.FC<PassengerDossierProps> = ({ passenger, onInspect, isActive }) => {
  const trustLevelColor = () => {
    if (passenger.trustLevel >= 80) return 'bg-green-600/50';
    if (passenger.trustLevel >= 50) return 'bg-yellow-600/50';
    return 'bg-red-600/50';
  };

  return (
    <div 
      className={`relative p-4 rounded-lg border transition-all duration-300 ${
        isActive 
          ? 'bg-[#2a2a2a] border-[#e2e0dc]/30' 
          : 'bg-[#1b1b1b] border-[#2a2a2a] hover:border-[#e2e0dc]/20'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-['Playfair_Display'] font-bold text-[#e2e0dc]">
            {passenger.name}
          </h3>
          <p className="text-sm text-[#e2e0dc]/70">{passenger.title}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-[#e2e0dc]/50">
            Trust: {passenger.trustLevel}%
          </div>
          <div className={`w-2 h-2 rounded-full ${trustLevelColor()}`} />
        </div>
      </div>

      <p className="text-sm text-[#e2e0dc]/80 mb-4 line-clamp-2">
        {passenger.description}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {passenger.artifacts.map(artifact => (
            <span 
              key={artifact.id}
              className="px-2 py-1 text-xs bg-[#2a2a2a] text-[#e2e0dc]/70 rounded"
            >
              {artifact.name}
            </span>
          ))}
        </div>
        <button
          onClick={onInspect}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            isActive
              ? 'bg-[#e2e0dc]/10 text-[#e2e0dc]'
              : 'bg-[#2a2a2a] text-[#e2e0dc]/70 hover:bg-[#e2e0dc]/10 hover:text-[#e2e0dc]'
          }`}
        >
          {isActive ? 'Inspecting...' : 'Inspect'}
        </button>
      </div>
    </div>
  );
}; 