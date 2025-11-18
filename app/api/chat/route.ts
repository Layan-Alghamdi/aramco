import { NextResponse } from 'next/server';
import { generateAssistantReply } from '@/lib/chatHelpers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected messages array.' },
        { status: 400 }
      );
    }

    // Generate assistant reply using the helper function
    // This can be easily replaced with a real LLM call later
    const assistantMessage = generateAssistantReply(messages);

    return NextResponse.json({
      message: assistantMessage
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

