import OpenAI from 'openai';
import { Passenger } from '../data/passengers';

export class ChatService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Required for browser usage
    });
  }

  async sendMessage(message: string, passenger: Passenger): Promise<string> {
    try {
      const systemPrompt = `You are ${passenger.name}, ${passenger.title}. ${passenger.background}
Your responses should reflect your character's personality and knowledge.
You have the following secrets that you're trying to hide:
${passenger.secrets.map(secret => `- ${secret}`).join('\n')}

You have these artifacts:
${passenger.artifacts.map(artifact => `- ${artifact.name}: ${artifact.description}`).join('\n')}

Respond to the inspector's questions while maintaining your character's personality and trying to hide your secrets.
Be evasive when asked about sensitive topics, but don't be obvious about it.
If pressed too hard about a secret, you might reveal a partial truth or a carefully constructed lie.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return response.choices[0]?.message?.content || 'I apologize, but I cannot respond at this time.';
    } catch (error) {
      console.error('Error in chat service:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Invalid or missing OpenAI API key. Please check your .env file.');
        } else if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again in a few moments.');
        } else if (error.message.includes('401')) {
          throw new Error('Authentication failed. Please check your API key.');
        }
      }
      
      throw new Error('Failed to get response from AI');
    }
  }
} 