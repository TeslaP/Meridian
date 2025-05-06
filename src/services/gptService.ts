import { Passenger } from '../data/passengers';

export interface GPTResponse {
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

export interface DialogueEntry {
  speaker: 'inspector' | 'character';
  text: string;
  timestamp: number;
}

export interface EmotionalState {
  mood: 'nervous' | 'defensive' | 'cooperative' | 'hostile' | 'neutral';
  suspicion: number;
  stress: number;
}

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/chat'  // Use relative URL in production
  : 'http://localhost:3001/api/chat';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateCharacterResponse(
  passenger: Passenger,
  question: string,
  discoveredItems: Array<{ name: string; description: string }> = [],
  dialogueHistory: DialogueEntry[] = [],
  emotionalState?: EmotionalState
): Promise<GPTResponse> {
  console.log('Generating response for:', {
    passenger: passenger.name,
    question,
    discoveredItemsCount: discoveredItems.length,
    dialogueHistoryLength: dialogueHistory.length,
    emotionalState,
    apiUrl: API_URL,
    environment: process.env.NODE_ENV
  });

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Sending request to ${API_URL}`);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passenger,
          question,
          discoveredItems,
          dialogueHistory,
          emotionalState
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ details: 'Failed to parse error response' }));
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.details || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Validate response structure
      if (!data.response || typeof data.trustChange !== 'number') {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from server');
      }

      // Ensure trust change is within bounds
      data.trustChange = Math.max(-10, Math.min(10, data.trustChange));

      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < MAX_RETRIES) {
        const delayTime = RETRY_DELAY * attempt;
        console.log(`Retrying in ${delayTime}ms...`);
        await delay(delayTime); // Exponential backoff
      }
    }
  }

  console.error('All retry attempts failed:', lastError);
  
  // Generate a fallback response based on trust level
  const fallbackResponse: GPTResponse = {
    response: generateFallbackResponse(passenger, lastError?.message || 'Unknown error'),
    trustChange: -2, // Slight trust decrease for failed interaction
  };

  return fallbackResponse;
}

function generateFallbackResponse(passenger: Passenger, errorMessage: string): string {
  const trustLevel = passenger.trustLevel || 0;
  
  if (trustLevel < 30) {
    return "I don't feel comfortable discussing this right now.";
  } else if (trustLevel < 60) {
    return "I'm having trouble understanding your question. Could you rephrase that?";
  } else {
    return "I apologize, but I'm having some difficulty responding at the moment. Perhaps we could try a different approach?";
  }
} 