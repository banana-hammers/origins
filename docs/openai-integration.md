# OpenAI Integration Guide

This document provides information on how to use the OpenAI integration in the Origins project.

## Environment Setup

Before using the OpenAI features, ensure you have set up the necessary environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

You can add this to your `.env.local` file for local development. The OpenAI integration uses Next.js's built-in environment variable support, so it works in both server and edge runtime environments.

## Available Models

The default model for text generation is `gpt-4o-mini`. The following models are supported:

- `gpt-4o-mini` - Smaller, faster version of GPT-4o
- `gpt-4o` - Full-sized GPT-4o model

The UI provides a model selector that allows users to choose between these models.

## Available Services

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
    model: 'gpt-4o-mini',// Optional, defaults to 'gpt-4o-mini'
    maxTokens: 500       // Optional, defaults to 500
  }),
});

const result = await response.json();
```

### Streaming Text Generation

For improved user experience and reduced latency, you can use streaming to receive text chunks as they're generated:

```javascript
// Example streaming request
const response = await fetch('/api/openai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Your prompt here',
    type: 'completion',
    model: 'gpt-4o-mini', // Optional, defaults to 'gpt-4o-mini'
    maxTokens: 500,       // Optional, defaults to 500
    stream: true          // Enable streaming
  }),
});

// Process the stream manually
if (response.body) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Process each chunk of the streaming response
    console.log(chunk);
  }
}
```

For convenience, we also provide client-side helpers in `src/lib/streamClient.ts`:

```javascript
import { streamTextGeneration } from '@/lib/streamClient';

// React component example
function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  async function handleSendMessage(prompt) {
    // Initialize an empty message from the AI
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    // Stream the response and update the UI with each chunk
    await streamTextGeneration(
      prompt,
      (chunk) => {
        setMessages(prev => {
          const lastIndex = prev.length - 1;
          const updatedMessages = [...prev];
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: updatedMessages[lastIndex].content + chunk
          };
          return updatedMessages;
        });
      },
      {
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        onComplete: (fullText) => console.log('Stream complete')
      }
    );
  }
  
  // Rest of component...
}
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

## Streaming Best Practices

Streaming offers several benefits that improve the user experience:

1. **Reduced Latency** - Users see the first tokens much sooner, providing a more responsive experience.
2. **Cost Efficiency** - You can process tokens as they arrive and potentially terminate early if you've received enough information.
3. **Better User Experience** - Responses appear more conversational and interactive, similar to watching someone type.

When implementing streaming:

- Provide visual feedback (such as typing indicators) while waiting for the first tokens.
- Handle network interruptions gracefully by saving partial responses.
- Consider implementing a timeout mechanism for long-running requests.
- Test your application's behavior when the connection is slow or unstable.

## Edge Runtime

The OpenAI API routes are configured to use Next.js Edge Runtime, which offers lower latency and scales automatically with your application's traffic. This is particularly beneficial for streaming responses, where minimizing latency is crucial for a good user experience.