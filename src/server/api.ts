import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, '..', '..', '.env');
console.log('Looking for .env file at:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('\nError: Could not load .env file');
  console.error('Please create a .env file in the project root with:');
  console.error('\nOPENAI_API_KEY=your_api_key_here\n');
  process.exit(1);
}

// Log environment variables (without exposing the API key)
console.log('Environment loaded:', {
  port: process.env.PORT || 3001,
  hasApiKey: !!process.env.OPENAI_API_KEY
});

if (!process.env.OPENAI_API_KEY) {
  console.error('\nError: Missing OPENAI_API_KEY in .env file');
  console.error('Please add your OpenAI API key to the .env file:');
  console.error('\nOPENAI_API_KEY=your_api_key_here\n');
  process.exit(1);
}

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://meridian-teslap.vercel.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add security headers middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' http://localhost:3001 https://api.openai.com https://meridian-teslap.vercel.app; " +
    "frame-ancestors 'none';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    suspicion: number; // 0-100
    stress: number; // 0-100
  };
}

const chatHandler: RequestHandler = async (req: Request<{}, {}, ChatRequest>, res: Response): Promise<void> => {
  try {
    const { passenger, question, discoveredItems, dialogueHistory = [], emotionalState } = req.body;

    if (!passenger || !question) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    console.log('Processing request for:', {
      passenger: passenger.name,
      question,
      discoveredItemsCount: discoveredItems?.length || 0,
      dialogueHistoryLength: dialogueHistory.length,
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

    console.log('Sending request to OpenAI...');

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
    console.log('Received OpenAI response:', response);

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Check if response was truncated
    if (completion.choices[0].finish_reason === "length") {
      console.warn('Response was truncated due to length limit');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate response structure
    if (!parsedResponse.response || typeof parsedResponse.trustChange !== 'number') {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from OpenAI');
    }

    // Ensure trust change is within bounds
    parsedResponse.trustChange = Math.max(-10, Math.min(10, parsedResponse.trustChange));

    console.log('Sending response:', parsedResponse);
    res.status(200).json(parsedResponse);
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

app.post('/api/chat', chatHandler);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nError: Port ${PORT} is already in use.`);
    console.error('Please either:');
    console.error('1. Kill the process using this port:');
    console.error(`   lsof -i :${PORT} | grep LISTEN`);
    console.error(`   kill <PID>`);
    console.error('2. Or use a different port in your .env file:');
    console.error('   PORT=3002');
    process.exit(1);
  } else {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}); 