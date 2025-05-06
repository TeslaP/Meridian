import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
${discoveredItems?.map((item: any) => `- ${item.name}: ${item.description}`).join('\n') || 'No items discovered yet.'}

Your secrets (only you know these, don't reveal them unless trust is very high):
${passenger.secrets?.map((secret: string) => `- ${secret}`).join('\n') || 'No known secrets.'}

The inspector asks: "${question}"

Respond as your character would, considering:
1. Your personality and background
2. Your current trust level with the inspector
3. What items they've discovered
4. Your secrets and how much you want to reveal
5. The context of the question

Format your response as JSON with:
{
  "response": "your character's response",
  "trustChange": number between -10 and 10 indicating how this interaction affects trust
}

Make your response natural and in character. Don't mention the JSON format in your response.`;

    console.log('Sending request to OpenAI...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a character in an interrogation game. Respond in character and format your response as JSON. Never break character or mention the JSON format in your response."
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
} 