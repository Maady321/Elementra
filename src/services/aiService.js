/**
 * AI Service for Elementra AI Architect
 * Handles interaction with LLM APIs for generating website roadmaps and frontends.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const analyzeProjectWithAI = async (description) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error("VITE_OPENAI_API_KEY is missing.");
    return null;
  }

  const prompt = `
    You are a Senior Web Architect. Based on the business: "${description}", 
    generate a high-fidelity landing page.
    Return only a JSON object: 
    {
      "title": "Business Name",
      "niche": "one of: gym, restaurant, shop, portfolio, general",
      "pages": 5,
      "features": ["Feature A", "Feature B"],
      "theme": "Modern",
      "colors": ["#4F46E5", "#7C3AED"],
      "price": 4999,
      "dummyHtml": "A high-fidelity HTML string using Tailwind CSS and Unsplash images. Include a Hero, Features, About, and Contact section."
    }
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("OpenAI Error:", err);
      return null;
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Request failed:", error);
    return null;
  }
};
