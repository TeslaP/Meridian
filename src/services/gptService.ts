import { Passenger } from '../data/passengers';

interface GPTResponse {
  response: string;
  trustChange: number;
  revelations?: {
    newAssociates?: Array<{
      name: string;
      relationship: string;
      details: string;
    }>;
    biographyUpdates?: Array<{
      section: string;
      content: string;
    }>;
  };
}

const API_URL = 'http://localhost:3001/api/chat';

export const generateCharacterResponse = async (
  passenger: Passenger,
  question: string,
  discoveredItems: string[]
): Promise<GPTResponse> => {
  try {
    // Log the incoming request details
    console.log('=== GPT Request Details ===');
    console.log('Passenger:', {
      name: passenger.name,
      title: passenger.title,
      trustLevel: passenger.trustLevel
    });
    console.log('Question:', question);
    console.log('Discovered Items:', discoveredItems);

    const requestBody = {
      passenger: {
        name: passenger.name,
        title: passenger.title,
        description: passenger.description,
        background: passenger.background,
        trustLevel: passenger.trustLevel,
        secrets: passenger.secrets,
      },
      question,
      discoveredItems: passenger.artifacts
        .filter(artifact => discoveredItems.includes(artifact.id))
        .map(artifact => ({
          name: artifact.name,
          description: artifact.description,
          type: artifact.type,
          content: artifact.content,
        })),
    };

    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('=== API Response Status ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API Error: ${errorData.details || response.statusText}`);
    }

    const data = await response.json();
    console.log('=== GPT Response Data ===');
    console.log('Response:', data.response);
    console.log('Trust Change:', data.trustChange);
    console.log('Revelations:', data.revelations);

    if (!data.response || typeof data.trustChange !== 'number') {
      console.error('Invalid Response Format:', data);
      throw new Error('Invalid response format from API');
    }

    return {
      response: data.response,
      trustChange: data.trustChange,
      revelations: data.revelations
    };
  } catch (error) {
    console.error('=== Error in GPT Service ===');
    console.error('Error Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error Message:', error instanceof Error ? error.message : error);
    console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Character-specific fallback responses based on trust level and context
    const fallbackResponses: { [key: string]: string } = {
      'professor': "I must maintain my professional composure. These matters are... complex. Could you perhaps rephrase your question in a more precise manner?",
      'widow': "*adjusts black veil* My dear Inspector, some memories are too painful to discuss. Perhaps you could ask about something else?",
      'mechanic': "Look, I'm just trying to keep this train running. I don't have time for these questions. Can you be more specific about what you want to know?",
      'child': "*hugs music box closer* I... I don't understand what you're asking. Could you explain it differently?",
      'official': "I must remind you that I am here on official business. Your question touches on matters of state security. Please rephrase it appropriately.",
      'dr_zhang': "As a medical professional, I must be precise in my responses. Could you clarify your question?",
      'captain_kovacs': "I've been through worse interrogations than this. Ask your question again, and be direct about it.",
      'professor_blackwood': "Hmm, an interesting line of questioning, but perhaps not the most relevant. Could you clarify your intent?",
      'engineer_singh': "I need to be careful with my words, given the sensitive nature of our situation. Could you rephrase that?",
      'security_chief_vasquez': "I've dealt with enough liars to know when someone's fishing. Be more specific with your questions."
    };

    // Get character-specific response or use a generic one
    const fallbackResponse = fallbackResponses[passenger.id] || 
      `*${passenger.name} considers the question carefully*\nI'm not sure I understand what you're asking. Could you please rephrase that?`;

    console.log('=== Using Fallback Response ===');
    console.log('Character:', passenger.name);
    console.log('Fallback Response:', fallbackResponse);

    return {
      response: fallbackResponse,
      trustChange: -2,
    };
  }
}; 