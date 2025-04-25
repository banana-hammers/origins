import { NextRequest, NextResponse } from 'next/server';
import { generateText, generateEmbedding } from '../../../lib/openaiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    if (!body.text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const { text, type = 'completion', model, maxTokens } = body;

    let result;

    // Handle different OpenAI API operations
    if (type === 'embedding') {
      result = await generateEmbedding(text, model);
    } else {
      // Default to text generation
      result = await generateText(text, model, maxTokens);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}