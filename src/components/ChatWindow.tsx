import React, { useState, useRef, useEffect } from 'react';
import { Passenger } from '../data/passengers';
import { ChatService } from '../services/chatService';

interface ChatWindowProps {
  passenger: Passenger;
  isLoading: boolean;
  onError: (error: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  passenger,
  isLoading,
  onError,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = useRef<ChatService | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      onError('OpenAI API key is missing. Please create a .env file with VITE_OPENAI_API_KEY=your_api_key_here');
      return;
    }
    chatService.current = new ChatService(apiKey);
  }, [onError]);

  useEffect(() => {
    // Reset messages when passenger changes
    setMessages([]);
  }, [passenger]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatService.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await chatService.current.sendMessage(userMessage, passenger);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      onError('Failed to send message. Please try again.');
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Interrogation: {passenger.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}; 