import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatService {
  sendMessage(messages: ChatMessage[]): Promise<string>;
}

export class OpenAIService implements ChatService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
    });

    return response.choices[0]?.message?.content || '';
  }
}

// Placeholder for local LLM implementation
export class LocalLLMService implements ChatService {
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    // Implement local LLM logic here
    throw new Error('Local LLM not implemented');
  }
} 