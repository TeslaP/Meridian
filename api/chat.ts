import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import cors from 'cors';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure CORS
const corsMiddleware = cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

// Helper function to handle errors
function handleError(res: VercelResponse, status: number, code: string, message: string, details?: string) {
  console.error(`Error ${status}: ${message}`, details ? `Details: ${details}` : '');
  return res.status(status).json({
    error: {
      code,
      message,
      ...(details && { details })
    }
  });
}

interface ChatRequest {
  passenger: {
    id: string;
    name: string;
    title: string;
    description: string;
    background: string;
    trustLevel: number;
    secrets: string[];
  };
  question: string;
  discoveredItems: Array<{
    name: string;
    description: string;
    type: string;
    content: string;
  }>;
  dialogueHistory?: Array<{
    speaker: 'inspector' | 'character';
    text: string;
    timestamp: number;
  }>;
  emotionalState?: {
    mood: 'nervous' | 'defensive' | 'cooperative' | 'hostile' | 'neutral';
    suspicion: number;
    stress: number;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply CORS middleware
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result: Error | undefined) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result);
    });
  });

  try {
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // Ensure only POST requests are allowed
    if (req.method !== 'POST') {
      return handleError(res, 405, '405', 'Method not allowed', `Expected POST, got ${req.method}`);
    }

    // Validate request body
    if (!req.body) {
      return handleError(res, 400, '400', 'Bad request', 'Request body is required');
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return handleError(res, 500, '500', 'Server configuration error', 'OpenAI API key is not configured');
    }

    const { passenger, question, discoveredItems, dialogueHistory = [], emotionalState } = req.body as ChatRequest;

    // Validate required fields
    if (!passenger?.id || !passenger?.name || !passenger?.title || !passenger?.description || !passenger?.background) {
      return handleError(res, 400, '400', 'Invalid passenger data', 'Missing required passenger fields');
    }

    if (!question || typeof question !== 'string') {
      return handleError(res, 400, '400', 'Invalid question', 'Question must be a non-empty string');
    }

    // Log request details
    console.log('Processing request:', {
      passenger: {
        id: passenger.id,
        name: passenger.name,
        trustLevel: passenger.trustLevel
      },
      question,
      discoveredItemsCount: discoveredItems?.length,
      dialogueHistoryLength: dialogueHistory?.length,
      emotionalState
    });

    const jsonSchema = {
      type: "object",
      properties: {
        response: { type: "string" },
        trustChange: { type: "number", minimum: -10, maximum: 10 },
        revelations: {
          type: "object",
          properties: {
            newAssociates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  relationship: { type: "string" },
                  details: { type: "string" }
                },
                required: ["name", "relationship", "details"]
              }
            },
            biographyUpdates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string", enum: ["background", "description", "secrets"] },
                  content: { type: "string" }
                },
                required: ["section", "content"]
              }
            }
          }
        }
      },
      required: ["response", "trustChange"]
    };

    const getCharacterPrompt = (passenger: ChatRequest['passenger']) => {
      return `You are roleplaying as a passenger on the space train Meredian. You are currently being interrogated by an inspector.

Your character:
- **Name**: ${passenger.name}
- **Title**: ${passenger.title}
- **Description**: ${passenger.description}
- **Background**: ${passenger.background}
- **Known secrets**: ${passenger.secrets?.join(', ') || 'None revealed yet'}
- **Trust Level with Inspector**: ${passenger.trustLevel} / 10

Recent events:
- **Discovered Items**: 
  ${discoveredItems && discoveredItems.length > 0 
    ? discoveredItems.map(item => `- ${item.name}: ${item.description}`).join('\n')
    : 'None'}
- **Emotional State**: 
  - Mood: ${emotionalState?.mood || 'Unknown'}
  - Suspicion: ${emotionalState?.suspicion ?? 'N/A'} / 100
  - Stress: ${emotionalState?.stress ?? 'N/A'} / 100

Recent dialogue:
${dialogueHistory && dialogueHistory.length > 0
  ? dialogueHistory.slice(-5).map(d => 
      `${d.speaker === 'inspector' ? 'Inspector' : passenger.name}: "${d.text}"`
    ).join('\n')
  : 'No dialogue yet'}

Instruction:
Respond **in character** as ${passenger.name}, using their voice and perspective. Your tone and behavior should reflect your emotional state and current trust level. 

You may:
- Reveal or withhold information based on trust.
- Be evasive, aggressive, or vulnerable depending on stress/suspicion.
- React to the inspector's question authentically.

**Current question from the Inspector**:
"${question}"

Respond with a single spoken reply as the character (no narration).

Your response must be a valid JSON object that strictly adheres to the following schema:
${JSON.stringify(jsonSchema, null, 2)}

Do not mention or reference the JSON format, and never break character. When you refer to other characters or reveal additional information, include those details in the "revelations" section of your JSON output.`;
    };

    const prompt = getCharacterPrompt(passenger);

    console.log('Sending request to OpenAI:', {
      model: "gpt-4-1106-preview",
      prompt: prompt.substring(0, 100) + '...', // Log first 100 chars of prompt
      passengerName: passenger.name,
      questionLength: question.length
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are a character in *Meredian*, a dystopian, retro-futuristic interrogation game set aboard a mysterious inspection train in a decaying, post-war empire. Respond solely as your character, using natural language that reflects your background and personality in this atmosphere. Format your answer as a valid JSON object per the provided schema, but do not mention that you are using JSON. Always stay in character, and when divulging details about other characters or secrets, include them in the "revelations" section.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;

    if (!response) {
      console.error('No response from OpenAI');
      throw new Error('No response from OpenAI');
    }

    console.log('Raw OpenAI response:', response);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
      console.log('Parsed OpenAI response:', parsedResponse);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error, 'Raw response:', response);
      throw new Error('Invalid response format from OpenAI');
    }

    if (!parsedResponse.response || typeof parsedResponse.trustChange !== 'number') {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from OpenAI');
    }

    parsedResponse.trustChange = Math.max(-10, Math.min(10, parsedResponse.trustChange));

    console.log('Sending final response:', {
      responseLength: parsedResponse.response.length,
      trustChange: parsedResponse.trustChange,
      hasRevelations: !!parsedResponse.revelations,
      response: parsedResponse.response.substring(0, 100) + '...' // Log first 100 chars of response
    });

    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({
      error: {
        code: '500',
        message: 'A server error has occurred',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      }
    });
  }
} 