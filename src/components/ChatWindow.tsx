import React, { useState, useRef, useEffect } from 'react';
import { Passenger } from '../data/passengers';
import { sendChatMessage, ApiError } from '../services/api';
import { getCharacterGreeting } from '../utils/characterUtils';

interface Message {
  id: string;
  content: string;
  sender: 'inspector' | 'character' | 'system';
  timestamp: Date;
}

interface ChatWindowProps {
  passenger: Passenger;
  isLoading: boolean;
  onError: (error: string) => void;
  onItemDiscovery: (passengerId: string, itemId: string) => void;
  onTrustChange: (passengerId: string, change: number) => void;
  onChatResponse: (response: any) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  passenger,
  isLoading,
  onError,
  onItemDiscovery,
  onTrustChange,
  onChatResponse,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat with character greeting
    const greeting = getCharacterGreeting(passenger);
    setMessages([
      {
        id: 'system-1',
        content: `Interrogation Protocol Initialized\nSubject: ${passenger.name}\nTrust Level: ${passenger.trustLevel}%`,
        sender: 'system',
        timestamp: new Date()
      },
      {
        id: 'character-1',
        content: greeting,
        sender: 'character',
        timestamp: new Date()
      }
    ]);
  }, [passenger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message to chat
    const newMessage = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'inspector' as const,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      // Convert messages to dialogue history format
      const dialogueHistory = messages.map(msg => ({
        speaker: msg.sender === 'inspector' ? 'inspector' as const : 'character' as const,
        text: msg.content,
        timestamp: msg.timestamp.getTime()
      }));

      const response = await sendChatMessage(
        passenger,
        userMessage,
        passenger.artifacts
          .filter(a => a.discovered)
          .map(a => ({
            name: a.name,
            description: a.description,
            type: a.type || 'unknown',
            content: a.content || ''
          })),
        dialogueHistory,
        {
          mood: 'neutral',
          suspicion: 50,
          stress: 50
        }
      );

      // Add character response to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: response.response,
          sender: 'character',
          timestamp: new Date()
        }
      ]);

      // Handle trust change
      if (response.trustChange !== 0) {
        onTrustChange(passenger.id, response.trustChange);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            content: `Trust Level ${response.trustChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(response.trustChange)}%`,
            sender: 'system',
            timestamp: new Date()
          }
        ]);
      }

      // Handle revelations
      if (response.revelations) {
        onChatResponse(response);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to get response from character';
      onError(errorMessage);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `Error: ${errorMessage}`,
          sender: 'system',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'inspector' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'inspector'
                  ? 'bg-blue-600 text-white'
                  : message.sender === 'system'
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing || isLoading}
          />
          <button
            type="submit"
            disabled={isProcessing || isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}; 