import dotenv from 'dotenv';
import { join } from 'path';

const __dirname = process.cwd();

// Try different paths for .env file
const envPaths = [
  join(__dirname, '.env'),
  join(__dirname, '.env.local'),
  join(__dirname, 'src', 'server', '.env'),
  join(__dirname, 'src', 'server', '.env.local')
];

let envLoaded = false;
for (const path of envPaths) {
  const result = dotenv.config({ path });
  if (!result.error) {
    console.log('Loaded environment from:', path);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No environment file found in:', envPaths);
}

interface Config {
  port: number;
  openaiApiKey: string;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigins: string[];
  maxTokens: number;
  temperature: number;
}

function validateConfig(config: Partial<Config>): config is Config {
  if (!config.openaiApiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
  if (!config.port || isNaN(Number(config.port))) {
    throw new Error('Invalid PORT environment variable');
  }
  return true;
}

export const config: Config = {
  port: Number(process.env.PORT) || 3001,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  nodeEnv: (process.env.NODE_ENV as Config['nodeEnv']) || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,https://meridian-teslap.vercel.app').split(','),
  maxTokens: Number(process.env.MAX_TOKENS) || 500,
  temperature: Number(process.env.TEMPERATURE) || 0.9
};

validateConfig(config); 