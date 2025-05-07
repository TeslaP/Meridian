import { Passenger } from '../data/passengers';

export interface ChatResponse {
  response: string;
  trustChange: number;
  revelations?: {
    newAssociates?: Array<{
      name: string;
      relationship: string;
      details: string;
    }>;
    biographyUpdates?: Array<{
      section: 'background' | 'description' | 'secrets';
      content: string;
    }>;
  };
}

export interface ChatError {
  code: string;
  message: string;
  details?: string;
}

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://meridian-one.vercel.app/api/chat'
  : 'http://localhost:3001/api/chat';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function sendChatMessage(
  passenger: Passenger,
  question: string,
  discoveredItems: Array<{
    name: string;
    description: string;
    type: string;
    content: string;
  }> = [],
  dialogueHistory: Array<{
    speaker: 'inspector' | 'character';
    text: string;
    timestamp: number;
  }> = [],
  emotionalState?: {
    mood: 'nervous' | 'defensive' | 'cooperative' | 'hostile' | 'neutral';
    suspicion: number;
    stress: number;
  }
): Promise<ChatResponse> {
  try {
    console.log('Sending chat message:', {
      passenger: {
        id: passenger.id,
        name: passenger.name,
        title: passenger.title,
        trustLevel: passenger.trustLevel
      },
      question,
      discoveredItemsCount: discoveredItems.length,
      dialogueHistoryLength: dialogueHistory.length,
      emotionalState
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({
        passenger,
        question,
        discoveredItems,
        dialogueHistory,
        emotionalState
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('API error:', data.error);
      throw new ApiError(
        data.error?.code || '500',
        data.error?.message || 'An error occurred',
        data.error?.details
      );
    }

    return data;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      '500',
      'Failed to send message',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
} 