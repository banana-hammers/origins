import { createParser, type EventSourceMessage } from 'eventsource-parser';

/**
 * Creates a TransformStream that converts OpenAI chat completion chunks into text fragments
 */
export function createChunkDecoder() {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  return new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk);
      // Extract the text from the OpenAI streaming format
      const lines = text.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        // Skip "data: [DONE]" messages
        if (line === 'data: [DONE]') continue;
        
        // Remove the "data: " prefix
        const message = line.replace(/^data: /, '');
        try {
          const json = JSON.parse(message);
          // Get content from chat completion chunks
          const content = json.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        } catch (error) {
          console.error('Error parsing JSON from stream:', error);
        }
      }
    }
  });
}

// Define a type for OpenAI's streaming response which is an async iterable
export interface OpenAIStreamingResponse {
  [Symbol.asyncIterator](): AsyncIterator<{
    choices: Array<{
      delta: {
        content?: string;
      };
    }>;
  }>;
}

/**
 * Converts an async iterable from OpenAI into a ReadableStream
 * This works with OpenAI SDK v4.96.0+ which returns streaming responses as async iterables
 * @param asyncIterable The async iterable response from OpenAI API
 */
export function asyncIterableToReadableStream(asyncIterable: OpenAIStreamingResponse): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of asyncIterable) {
          // Extract the content from the chunk
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        // Signal that the stream is complete
        controller.close();
      } catch (error) {
        console.error('Error processing async iterable:', error);
        controller.error(error);
      }
    }
  });
}

// Legacy interface for backward compatibility
interface OpenAIStream {
  pipeThrough: (transformer: unknown) => ReadableStream<Uint8Array>;
}

/**
 * Converts an OpenAI stream into a ReadableStream of text chunks
 * @param stream The stream response from OpenAI API
 * @deprecated Use asyncIterableToReadableStream for OpenAI SDK v4.96.0+
 */
export function openAIStreamToReadable(stream: OpenAIStream): ReadableStream<Uint8Array> {
  return stream.pipeThrough(createChunkDecoder());
}

/**
 * Creates a text event stream for Server-Sent Events (SSE)
 * @param response The response from OpenAI API
 * @returns A ReadableStream that can be used as a response body
 */
export function createEventStream(response: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      // Convert the response into a readable stream
      const reader = response.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Signal that the stream is complete
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            break;
          }
          
          // Format as SSE
          const text = new TextDecoder().decode(value);
          controller.enqueue(encoder.encode(`data: ${text}\n\n`));
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });
}
