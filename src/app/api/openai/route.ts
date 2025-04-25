import { NextRequest, NextResponse } from 'next/server';
import { generateText, generateEmbedding } from '../../../lib/openaiService';
import { 
  openAIStreamToReadable, 
  createEventStream, 
  asyncIterableToReadableStream,
  OpenAIStreamingResponse
} from '../../../lib/streamingUtils';

export const runtime = 'edge';

// Legacy type for backward compatibility
type StreamWithPipeThrough = {
  pipeThrough: (transformer: unknown) => ReadableStream<Uint8Array>;
};

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

    const { text, type = 'completion', model, maxTokens, stream = false } = body;

    let result;

    // Handle streaming for text generation
    if (type === 'completion' && stream === true) {
      // Call generateText with stream option
      result = await generateText(text, model, maxTokens, true);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      // Process the streaming response
      const streamingResponse = result.data;
      
      try {
        let readableStream: ReadableStream<Uint8Array>;
        
        // Check if the response is an async iterable (OpenAI SDK v4.96.0+)
        if (streamingResponse && typeof streamingResponse === 'object' && Symbol.asyncIterator in streamingResponse) {
          // Convert the async iterable to a ReadableStream
          readableStream = asyncIterableToReadableStream(streamingResponse as OpenAIStreamingResponse);
        } 
        // For backward compatibility, check if it has a pipeThrough method
        else if (streamingResponse && typeof streamingResponse === 'object' && 'pipeThrough' in streamingResponse) {
          readableStream = openAIStreamToReadable(streamingResponse as StreamWithPipeThrough);
        } 
        else {
          // If we don't have a valid stream format, return an error
          return NextResponse.json(
            { success: false, error: 'Invalid stream response from OpenAI' },
            { status: 500 }
          );
        }
        
        // Format as SSE (Server-Sent Events)
        const eventStream = createEventStream(readableStream);
        
        // Return the stream response with appropriate headers
        return new Response(eventStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (error) {
        console.error('Error processing stream:', error);
        return NextResponse.json(
          { success: false, error: 'Error processing stream' },
          { status: 500 }
        );
      }
    }

    // Handle different non-streaming OpenAI API operations
    if (type === 'embedding') {
      result = await generateEmbedding(text, model);
    } else {
      // Default to text generation (non-streaming)
      result = await generateText(text, model, maxTokens, false);
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