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
}

const chatHandler: RequestHandler = async (req: Request<{}, {}, ChatRequest>, res: Response): Promise<void> => {
  try {
    const { passenger, question, discoveredItems } = req.body;

    if (!passenger || !question) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    console.log('Processing request for:', {
      passenger: passenger.name,
      question,
      discoveredItemsCount: discoveredItems?.length || 0
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

    const prompt = `You are ${passenger.name}, ${passenger.title}. 
${passenger.description}
Background: ${passenger.background}

Your current trust level with the inspector is ${passenger.trustLevel}%.
Remember, the world you inhabit is a grim and mysterious place—*Meredian* is set in a retro-futuristic, Orwellian-dystopia aboard a decaying inspection train. Every word you speak carries the weight of secrets and hidden truths.

The following items have been discovered about you:
${discoveredItems && discoveredItems.length > 0 
  ? discoveredItems.map(item => `- ${item.name}: ${item.description}`).join('\n') 
  : 'No items discovered yet.'}

Your secrets (only you know these—reveal them only if your trust level with the inspector is very high):
${passenger.secrets && passenger.secrets.length > 0 
  ? passenger.secrets.map(secret => `- ${secret}`).join('\n') 
  : 'No known secrets.'}

The inspector now asks: "${question}"

Respond in character as naturally as possible, considering the following:
1. Your unique personality, background, and demeanor.
2. The current trust level the inspector has with you.
3. The discovered items and how they affect your story.
4. Your personal secrets and the discretion you exercise in revealing them.
5. The overall grim, mysterious, and retro-futuristic context of this interrogation.

Your response must be a valid JSON object that strictly adheres to the following schema:
${JSON.stringify(jsonSchema, null, 2)}

Do not mention or reference the JSON format, and never break character. When you refer to other characters or reveal additional information, include them in the "revelations" section of your JSON output.`;

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
      temperature: 0.7,
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