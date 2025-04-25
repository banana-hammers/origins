/**
 * Handles a streaming response from the OpenAI API
 * @param response The response from the fetch API
 * @param onChunk Callback function that processes each chunk of text as it arrives
 * @param onComplete Optional callback function that runs when streaming is complete
 */
export async function handleStreamingResponse(
  response: Response,
  onChunk: (chunk: string) => void,
  onComplete?: (fullText: string) => void
): Promise<void> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (onComplete) {
          onComplete(fullText);
        }
        break;
      }
      
      // Decode the chunk and process it
      const chunk = decoder.decode(value, { stream: true });
      
      // Process each line (SSE format sends data line by line)
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          
          // Check for the [DONE] message
          if (data === '[DONE]') continue;
          
          try {
            // Process normal chunk
            onChunk(data);
            fullText += data;
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading stream:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Sends a streaming text generation request to the OpenAI API
 * @param prompt The prompt to send to the API
 * @param onChunk Callback function to process each text chunk
 * @param options Optional parameters for the request
 * @returns A promise that resolves when streaming is complete
 */
export async function streamTextGeneration(
  prompt: string,
  onChunk: (chunk: string) => void,
  options: {
    model?: string;
    maxTokens?: number;
    onComplete?: (fullText: string) => void;
  } = {}
): Promise<void> {
  const { model, maxTokens, onComplete } = options;
  
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      type: 'completion',
      model,
      maxTokens,
      stream: true,
    }),
  });
  
  return handleStreamingResponse(response, onChunk, onComplete);
}

/**
 * React hook-friendly version that returns the accumulated text
 * For use with useState and useEffect
 * 
 * Example usage:
 * ```
 * const [text, setText] = useState('');
 * const [isLoading, setIsLoading] = useState(false);
 * 
 * const handleSubmit = async (prompt) => {
 *   setIsLoading(true);
 *   setText('');
 *   try {
 *     await streamTextGenerationWithState(
 *       prompt, 
 *       (chunk) => setText(prev => prev + chunk),
 *       { onComplete: () => setIsLoading(false) }
 *     );
 *   } catch (error) {
 *     console.error('Error:', error);
 *     setIsLoading(false);
 *   }
 * };
 * ```
 */
export async function streamTextGenerationWithState(
  prompt: string,
  updateStateFn: (chunk: string) => void,
  options: {
    model?: string;
    maxTokens?: number;
    onComplete?: (fullText: string) => void;
  } = {}
): Promise<void> {
  return streamTextGeneration(prompt, updateStateFn, options);
}