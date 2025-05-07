import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { config } from './config.js';

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://meridian-one.vercel.app'  // Must be exact origin for credentials
    : 'http://localhost:5173',  // Development origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type'],  // Safe headers that can be exposed
  maxAge: 86400  // Cache preflight requests for 24 hours
}));

// Add security headers
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:3001 https://api.openai.com https://meridian-one.vercel.app; frame-ancestors 'none';");
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

async function processChatRequest(request: {
  passenger: any;
  question: string;
  discoveredItems: any[];
  dialogueHistory: any[];
  emotionalState: { mood: string; suspicion: number; stress: number };
}) {
  // Generate the prompt
  const prompt = generatePrompt(request as ChatRequest);
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

  return parsedResponse;
}

async function chatHandler(req: express.Request, res: express.Response): Promise<void> {
  console.log('API handler called:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.status(204).end();
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Validate request body
    if (!req.body) {
      console.log('Missing request body');
      res.status(400).json({ error: 'Missing request body' });
      return;
    }

    const { passenger, question, discoveredItems, dialogueHistory, emotionalState } = req.body;

    // Validate required fields
    if (!passenger || !question) {
      console.log('Missing required fields:', { passenger, question });
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    console.log('Processing chat request:', {
      passengerId: passenger.id,
      question,
      discoveredItemsCount: discoveredItems?.length,
      dialogueHistoryCount: dialogueHistory?.length
    });

    // Process the chat request
    const response = await processChatRequest({
      passenger,
      question,
      discoveredItems: discoveredItems || [],
      dialogueHistory: dialogueHistory || [],
      emotionalState: emotionalState || { mood: 'neutral', suspicion: 0, stress: 0 }
    });

    console.log('Chat response generated:', {
      responseLength: response.response.length,
      trustChange: response.trustChange,
      revelationsCount: response.revelations.biographyUpdates.length
    });

    // Set CORS headers for the response
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export the handler for Vercel
export default chatHandler;

// Keep the Express app for local development
if (process.env.NODE_ENV !== 'production') {
  const port = config.port;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} 