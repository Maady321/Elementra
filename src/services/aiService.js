/**
 * AI Service for Elementra AI Architect
 * Routes requests through the server-side API to keep the OpenAI key secure.
 */

export const analyzeProjectWithAI = async (description) => {
  try {
    const response = await fetch('/api/ai-architect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('AI Service Error:', err);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
};
