import express from 'express';
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
  origin: 'http://localhost:5173', // Frontend URL
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
    "connect-src 'self' http://localhost:3001 https://api.openai.com; " +
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

app.post('/api/chat', async (req: express.Request<{}, {}, ChatRequest>, res: express.Response) => {
  try {
    const { passenger, question, discoveredItems } = req.body;

    if (!passenger || !question) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Processing request for:', {
      passenger: passenger.name,
      question,
      discoveredItemsCount: discoveredItems?.length || 0
    });

    const prompt = `You are ${passenger.name}, ${passenger.title}. 
${passenger.description}
Background: ${passenger.background}

Your current trust level with the inspector is ${passenger.trustLevel}%.

The following items have been discovered about you:
${discoveredItems?.map((item) => `- ${item.name}: ${item.description}`).join('\n') || 'No items discovered yet.'}

Your secrets (only you know these, don't reveal them unless trust is very high):
${passenger.secrets?.map((secret) => `- ${secret}`).join('\n') || 'No known secrets.'}

The inspector asks: "${question}"

Respond as your character would, considering:
1. Your personality and background
2. Your current trust level with the inspector
3. What items they've discovered
4. Your secrets and how much you want to reveal
5. The context of the question

If you mention any other characters or reveal new information about yourself, include it in the revelations section.

Format your response as JSON with:
{
  "response": "your character's response",
  "trustChange": number between -10 and 10 indicating how this interaction affects trust,
  "revelations": {
    "newAssociates": [
      {
        "name": "character name",
        "relationship": "how they are related to you",
        "details": "what you know about them"
      }
    ],
    "biographyUpdates": [
      {
        "section": "background|description|secrets",
        "content": "new information to add"
      }
    ]
  }
}

Make your response natural and in character. Don't mention the JSON format in your response.`;

    console.log('Sending request to OpenAI...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a character in an interrogation game. Respond in character and format your response as JSON. Never break character or mention the JSON format in your response. When mentioning other characters or revealing new information, include it in the revelations section."
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

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }

    if (!parsedResponse.response || typeof parsedResponse.trustChange !== 'number') {
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
});

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