import React from 'react';
import { Passenger } from '../data/passengers';

interface PassengerDossierProps {
  passenger: Passenger;
  onInspect: (passengerId: string) => void;
}

export const PassengerDossier: React.FC<PassengerDossierProps> = ({ passenger, onInspect }) => {
  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{passenger.title}</h2>
        <h3 className="text-xl text-gray-400 mb-4">{passenger.name}</h3>
        <p className="text-gray-300 mb-4">{passenger.description}</p>
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-lg font-semibold mb-2">Background</h4>
          <p className="text-gray-300">{passenger.background}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Artifacts</h4>
        <div className="space-y-3">
          {passenger.artifacts.map((artifact) => (
            <div
              key={artifact.id}
              className={`p-3 rounded ${
                artifact.isRevealed ? 'bg-gray-700' : 'bg-gray-900'
              }`}
            >
              <h5 className="font-medium">{artifact.name}</h5>
              {artifact.isRevealed && (
                <p className="text-sm text-gray-400 mt-1">{artifact.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Initial Statement</h4>
        <p className="text-gray-300 italic">"{passenger.initialDialogue}"</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Trust Level: {passenger.trustLevel}
        </div>
        <button
          onClick={() => onInspect(passenger.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {passenger.isInspected ? 'Re-inspect' : 'Inspect'}
        </button>
      </div>
    </div>
  );
}; 