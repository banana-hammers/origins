import { openai } from './openaiService';

const VISION_MODEL = 'gpt-4.1-nano-2025-04-14';

/**
 * Extract line items from an image of a quote or invoice
 * @param imageBase64 The base64-encoded image data
 * @returns Object containing success status, extracted data and usage statistics
 */
export async function extractEstimateFromImage(
  imageBase64: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract material line items from this quote/invoice and return the data as a JSON object with an "items" array.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      seed: 123,
    });

    return {
      success: true,
      data: JSON.parse(response.choices[0].message.content || '{}'),
      usage: response.usage,
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