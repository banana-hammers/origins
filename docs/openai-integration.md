# OpenAI Integration Guide

This document provides information on how to use the OpenAI integration in the Origins project.

## Environment Setup

Before using the OpenAI features, ensure you have set up the necessary environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

You can add this to your `.env.local` file for local development.

## Available Services

The OpenAI integration offers the following services:

### Text Generation

Generate text using OpenAI's GPT models by sending a POST request to the `/api/openai` endpoint:

```javascript
// Example request
const response = await fetch('/api/openai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Your prompt here',
    type: 'completion',  // Optional, defaults to 'completion'
    model: 'gpt-4o',     // Optional, defaults to 'gpt-4o'
    maxTokens: 500       // Optional, defaults to 500
  }),
});

const result = await response.json();
```

### Embeddings

Generate embeddings for a text using OpenAI's embedding models:

```javascript
// Example request
const response = await fetch('/api/openai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Text to embed',
    type: 'embedding',
    model: 'text-embedding-3-small'  // Optional, defaults to 'text-embedding-3-small'
  }),
});

const result = await response.json();
```

## Testing

A test script is available in `src/scripts/test-openai.ts` that demonstrates both text completion and embedding functionality.

To run the test:

1. Ensure your environment variables are set
2. Start the development server with `npm run dev`
3. In a separate terminal, run:
   ```
   npx ts-node src/scripts/test-openai.ts
   ```

## Error Handling

All OpenAI service functions return a consistent response format:

```javascript
{
  success: boolean,
  data?: any,       // Present if success is true
  error?: string    // Present if success is false
}
```

This allows for consistent error handling across your application.