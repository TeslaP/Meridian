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
  : 'http://localhost:3000/api/chat'; // Update to match Vercel's development port

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateCharacterResponse(
  passenger: Passenger,
  question: string,
  discoveredItems: Array<{ 
    name: string; 
    description: string;
    type?: string;
    content?: string;
  }> = [],
  dialogueHistory: DialogueEntry[] = [],
  emotionalState?: EmotionalState
): Promise<GPTResponse> {
  console.log('Generating response for:', {
    passenger: passenger.name,
    question,
    discoveredItemsCount: discoveredItems.length,
    discoveredItems,
    dialogueHistoryLength: dialogueHistory.length,
    emotionalState,
    apiUrl: API_URL,
    environment: process.env.NODE_ENV
  });

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Sending request to ${API_URL}`);
      
      const requestPayload = {
        passenger,
        question,
        discoveredItems: discoveredItems.map(item => ({
          name: item.name,
          description: item.description,
          type: item.type || 'unknown',
          content: item.content || ''
        })),
        dialogueHistory,
        emotionalState
      };

      console.log('Request payload:', JSON.stringify(requestPayload, null, 2));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload),
        credentials: 'omit' // Don't send cookies
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { 
            error: 'Failed to parse error response',
            details: `HTTP error ${response.status}`
          };
        }
        
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestBody: {
            passenger: passenger.name,
            question,
            discoveredItemsCount: discoveredItems.length
          }
        });

        // Handle specific error cases
        if (response.status === 405) {
          throw new Error('API endpoint does not support this request method. Please check the API configuration.');
        } else if (response.status === 400) {
          throw new Error(errorData.details || 'Invalid request data');
        } else if (response.status === 500) {
          throw new Error(errorData.details || 'Internal server error');
        } else {
          throw new Error(errorData.details || errorData.error || `HTTP error ${response.status}`);
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Failed to parse response:', error);
        throw new Error('Invalid response format from server');
      }

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
  
  // Generate a fallback response based on trust level and error
  const fallbackResponse: GPTResponse = {
    response: generateFallbackResponse(passenger, lastError?.message || 'Unknown error'),
    trustChange: -2, // Slight trust decrease for failed interaction
  };

  return fallbackResponse;
}

function generateFallbackResponse(passenger: Passenger, errorMessage: string): string {
  console.error('Generating fallback response due to:', errorMessage);
  const trustLevel = passenger.trustLevel || 0;
  
  if (errorMessage.includes('API endpoint does not support')) {
    return "I apologize, but there seems to be a technical issue with the communication system. Please try again in a moment.";
  } else if (errorMessage.includes('Invalid request')) {
    return "I'm having trouble understanding your question. Could you rephrase that?";
  } else if (trustLevel < 30) {
    return "I don't feel comfortable discussing this right now.";
  } else if (trustLevel < 60) {
    return "I'm having trouble understanding your question. Could you rephrase that?";
  } else {
    return "I apologize, but I'm having some difficulty responding at the moment. Perhaps we could try a different approach?";
  }
} 