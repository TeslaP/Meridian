import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { config } from './config.js';

const app = express();

// Configure CORS
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Add security headers
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:3001 https://api.openai.com https://meridian-teslap.vercel.app; frame-ancestors 'none';");
  next();
});

app.use(express.json());

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

interface ChatRequest {
  passenger: {
    id: string;
    name: string;
    title: string;
    description: string;
    background: string;
    trustLevel: number;
    secrets: string[];
    artifacts?: Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      content: string;
      discovered: boolean;
    }>;
  };
  question: string;
  discoveredItems: Array<{
    name: string;
    description: string;
    type: string;
    content: string;
  }>;
  dialogueHistory: Array<{
    speaker: 'inspector' | 'character';
    text: string;
    timestamp: number;
  }>;
  emotionalState: {
    mood: string;
    suspicion: number;
    stress: number;
  };
}

function generatePrompt(request: ChatRequest): string {
  const { passenger, question, discoveredItems, dialogueHistory, emotionalState } = request;
  
  const prompt = `You are ${passenger.name}, ${passenger.title}. ${passenger.description}
Background: ${passenger.background}
Current trust level: ${passenger.trustLevel}
Emotional state: Mood - ${emotionalState.mood}, Suspicion - ${emotionalState.suspicion}, Stress - ${emotionalState.stress}

Your secrets:
${passenger.secrets.map(secret => `- ${secret}`).join('\n')}

${discoveredItems.length > 0 ? `The inspector has discovered:
${discoveredItems.map(item => `- ${item.name}: ${item.description}`).join('\n')}` : ''}

${dialogueHistory.length > 0 ? `Previous conversation:
${dialogueHistory.map(msg => `${msg.speaker === 'inspector' ? 'Inspector' : passenger.name}: ${msg.text}`).join('\n')}` : ''}

Inspector's question: "${question}"

Respond in character, considering your emotional state and trust level. Include:
1. A direct response to the question
2. Any trust level changes (-5 to +5)
3. Any new revelations about your background or associates that this conversation might reveal

Format your response as JSON:
{
  "response": "your in-character response",
  "trustChange": number,
  "revelations": {
    "newAssociates": [{"name": "name", "relationship": "relationship", "details": "details"}],
    "biographyUpdates": [{"section": "section name", "content": "new information"}]
  }
}`;

  return prompt;
}

async function chatHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    // Validate request
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Request body is required and must be an object'
        }
      });
    }

    const chatRequest = req.body as ChatRequest;

    // Validate required fields
    if (!chatRequest.passenger || !chatRequest.question) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Missing required fields: passenger and question are required'
        }
      });
    }

    // Generate the prompt
    const prompt = generatePrompt(chatRequest);
    console.log('Generated prompt:', prompt);
    console.log('Max tokens:', config.maxTokens);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a character in an interrogation game. Respond in character based on the provided context."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      response_format: { type: "json_object" }
    });

    console.log('OpenAI response received:', {
      finish_reason: completion.choices[0].finish_reason,
      usage: completion.usage,
      has_content: !!completion.choices[0].message.content
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('No response content from OpenAI');
    }

    // Parse and validate the response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }

    // Check if response was truncated
    if (completion.choices[0].finish_reason === "length") {
      console.warn('Response was truncated due to length limit');
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error in chat handler:', error);

    // Check for OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type
      });

      return res.status(error.status || 500).json({
        error: {
          code: error.code || 'OPENAI_ERROR',
          message: error.message
        }
      });
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage
      }
    });
  }
}

// Export the handler for Vercel
export default async function handler(req: express.Request, res: express.Response) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  return chatHandler(req, res, () => {});
}

// Keep the Express app for local development
if (process.env.NODE_ENV !== 'production') {
  const port = config.port;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} 