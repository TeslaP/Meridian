import React, { useState, useRef, useEffect } from 'react';
import { Passenger } from '../data/passengers';
import { generateCharacterResponse } from '../services/gptService';

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
  onItemDiscovery: (passengerId: string, discoveredItems: string[]) => void;
  onTrustChange: (passengerId: string, change: number) => void;
  onChatResponse: (response: any) => void;
}

const getCharacterGreeting = (passenger: Passenger): string => {
  const greetings: { [key: string]: string } = {
    'professor': "Ah, Inspector. I assure you, these are merely theoretical exercises. The Academy's concerns were... exaggerated. How may I assist your investigation?",
    'widow': "My dear Inspector... *clutches photograph tightly* My husband... he was a good man. The war took him from me, but his memory lives on. What brings you to speak with me?",
    'mechanic': "Just doing my job, Inspector. This old train needs constant attention, you know how it is. What can I help you with?",
    'child': "The music box was my mother's. She said it would keep me safe on my journey. Are you here to help me?",
    'official': "I trust you understand the importance of my mission, Inspector. Some questions are better left unasked. What do you need to know?",
    'dr_zhang': "I am Dr. Zhang, Chief Medical Officer. How may I assist you with your investigation?",
    'captain_kovacs': "Captain Kovacs at your service. What do you need to know?",
    'professor_blackwood': "Ah, another curious mind seeking answers. How may I enlighten you today?",
    'engineer_singh': "I'm Engineer Singh. I hope you're not here to question my work. What do you need?",
    'security_chief_vasquez': "Security Chief Vasquez. I don't have time for games. What's your business?"
  };
  return greetings[passenger.id] || passenger.initialDialogue;
};

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
  const [isInspecting, setIsInspecting] = useState(false);
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

  const handleInspect = () => {
    if (isInspecting) return;
    setIsInspecting(true);

    // Add inspection message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: `Initiating search protocol for ${passenger.name}...`,
      sender: 'system',
      timestamp: new Date()
    }]);

    // Simulate search process
    setTimeout(() => {
      const discoveredItems: string[] = [];
      
      // Roll for each undiscovered item
      passenger.artifacts.forEach(artifact => {
        if (!artifact.discovered) {
          const roll = Math.floor(Math.random() * 10) + 1;
          if (roll >= artifact.discoveryChance) {
            discoveredItems.push(artifact.id);
          }
        }
      });

      // Update discovered items
      if (discoveredItems.length > 0) {
        onItemDiscovery(passenger.id, discoveredItems);
        
        // Add discovery message
        const discoveredArtifacts = passenger.artifacts
          .filter(artifact => discoveredItems.includes(artifact.id))
          .map(artifact => `- ${artifact.name}: ${artifact.description}`)
          .join('\n');

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `Search complete. Discovered items:\n${discoveredArtifacts}`,
          sender: 'system',
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: 'Search complete. No new items discovered.',
          sender: 'system',
          timestamp: new Date()
        }]);
      }

      setIsInspecting(false);
    }, 2000);
  };

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

      const response = await generateCharacterResponse(
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
        dialogueHistory
      );

      // Add character response to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: response.response,
          sender: 'character',
          timestamp: new Date()
        },
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
          },
        ]);
      }

      // Handle revelations
      if (response.revelations) {
        onChatResponse(response);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      onError('Failed to generate response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getMessageStyle = (message: Message) => {
    const baseStyle = 'max-w-[80%] p-3 rounded-lg';
    switch (message.sender) {
      case 'inspector':
        return `${baseStyle} bg-[#2a2a2a] text-[#e2e0dc]`;
      case 'character':
        return `${baseStyle} bg-[#e2e0dc]/10 text-[#e2e0dc]`;
      case 'system':
        return `${baseStyle} bg-[#1a1a1a] text-[#e2e0dc]/70 italic`;
      default:
        return baseStyle;
    }
  };

  const getMessageIcon = (message: Message) => {
    switch (message.sender) {
      case 'inspector':
        return '👤';
      case 'character':
        return '👥';
      case 'system':
        return '💭';
      default:
        return '';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'branch':
        return '🔄';
      case 'escalate':
        return '⚠️';
      case 'close':
        return '🔒';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <h2 className="text-xl font-['Playfair_Display'] font-bold text-[#e2e0dc]">
            Interrogation: {passenger.name}
          </h2>
          <p className="text-sm text-[#e2e0dc]/70">{passenger.title}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-[#e2e0dc]/50">
            Trust Level: {passenger.trustLevel}%
          </div>
          <div className="w-2 h-2 rounded-full bg-yellow-600/50" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.sender === 'inspector'
                ? 'bg-[#e2e0dc]/10 ml-4'
                : message.sender === 'character'
                ? 'bg-[#e2e0dc]/5 mr-4'
                : 'bg-[#e2e0dc]/20 mx-4'
            }`}
          >
            <div className="text-sm text-[#e2e0dc]/70 mb-1">
              {message.sender === 'inspector'
                ? 'Inspector'
                : message.sender === 'character'
                ? passenger.name
                : 'System'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs text-[#e2e0dc]/50 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={handleInspect}
            disabled={isInspecting}
            className={`flex-1 px-4 py-2 rounded-lg ${
              isInspecting
                ? 'bg-[#e2e0dc]/20 text-[#e2e0dc]/50'
                : 'bg-[#e2e0dc]/10 text-[#e2e0dc] hover:bg-[#e2e0dc]/20'
            }`}
          >
            {isInspecting ? 'Searching...' : 'Inspect'}
          </button>
          <button
            className="flex-1 px-4 py-2 bg-[#e2e0dc]/10 text-[#e2e0dc] rounded-lg hover:bg-[#e2e0dc]/20"
            onClick={() => {
              const systemMessage: Message = {
                id: Date.now().toString(),
                content: "Logging new clue...",
                sender: 'system',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, systemMessage]);
            }}
          >
            Log Clue
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-[#1a1a1a] text-[#e2e0dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e2e0dc]/20"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 bg-[#e2e0dc]/10 text-[#e2e0dc] rounded-lg hover:bg-[#e2e0dc]/20 disabled:opacity-50"
          >
            {isProcessing ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}; 