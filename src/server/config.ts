import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try different paths for .env file
const envPaths = [
  join(__dirname, '..', '..', '.env'),
  join(__dirname, '..', '..', '.env.local'),
  join(__dirname, '.env'),
  join(__dirname, '.env.local')
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

export const config = {
  port: process.env.PORT || 3001,
  openaiApiKey: process.env.OPENAI_API_KEY
};

if (!config.openaiApiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
} 