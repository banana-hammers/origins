// This is a test file for verifying OpenAI API integration
import axios from 'axios';

/**
 * Test function for OpenAI API integration
 * Run this with `node test-openai.js` after setting the appropriate environment variables
 */
async function testOpenAIIntegration() {
  try {
    // Test completion endpoint
    console.log('Testing OpenAI text completion...');
    const completionResponse = await axios.post(
      'http://localhost:3000/api/openai',
      {
        text: 'Write a short paragraph about artificial intelligence.',
        type: 'completion',
      }
    );
    
    console.log('Completion result:');
    console.log(completionResponse.data);
    
    // Test embedding endpoint
    console.log('\nTesting OpenAI embeddings...');
    const embeddingResponse = await axios.post(
      'http://localhost:3000/api/openai',
      {
        text: 'Test embedding generation',
        type: 'embedding',
      }
    );
    
    console.log('Embedding result:');
    // Only show the first few values of the embedding for brevity
    if (embeddingResponse.data.success) {
      const embedding = embeddingResponse.data.data;
      console.log(`Successfully generated embedding with ${embedding.length} dimensions`);
      console.log('Sample values:', embedding.slice(0, 5), '...');
    } else {
      console.log(embeddingResponse.data);
    }
    
    console.log('\nOpenAI integration test completed successfully!');
  } catch (error) {
    console.error('Error testing OpenAI integration:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Call the test function
testOpenAIIntegration();