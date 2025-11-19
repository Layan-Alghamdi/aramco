import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set. Chat assistant will not be available.');
    return null;
  }

  try {
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
    return openaiClient;
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

