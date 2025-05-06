export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Passenger {
  id: string;
  name: string;
  title: string;
  background: string;
  appearance: string;
  systemPrompt: string;
}

export interface PassengerItem {
  id: string;
  name: string;
  description: string;
  suspicious: boolean;
}

export interface ChatState {
  messages: Message[];
  currentPassenger: Passenger | null;
  isInspecting: boolean;
  inspectedItems: string[];
} 