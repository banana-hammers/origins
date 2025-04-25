import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate text using OpenAI's GPT model
 * @param prompt The prompt to send to the API
 * @param model The model to use (defaults to gpt-4o-mini)
 * @param maxTokens Maximum number of tokens to generate
 * @param stream Whether to stream the response (defaults to false)
 */
export async function generateText(
  prompt: string,
  model: string = 'gpt-4o-mini',
  maxTokens: number = 500,
  stream: boolean = false
) {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      stream,
    });

    if (stream) {
      return {
        success: true,
        data: response, // Return the stream directly
        stream: true,
      };
    }

    // Need to cast response to access choices safely
    const completionResponse = response as OpenAI.Chat.Completions.ChatCompletion;
    
    return {
      success: true,
      data: completionResponse.choices[0].message.content,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}

/**
 * Generate embeddings for a text using OpenAI's embedding model
 * @param text The text to generate embeddings for
 * @param model The model to use (defaults to text-embedding-3-small)
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
) {
  try {
    const response = await openai.embeddings.create({
      model,
      input: text,
    });

    return {
      success: true,
      data: response.data[0].embedding,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}

// Export the OpenAI client for direct access if needed
export { openai };