/**
 * Vercel Serverless Function — AI Architect Proxy
 * Keeps the OpenAI API key server-side only.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description } = req.body || {};

  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'A business description is required.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith('your-key')) {
    console.error('Missing or invalid OPENAI_API_KEY environment variable');
    return res.status(500).json({ error: 'AI service is not configured on the server. Please provide a valid API key in .env.' });
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('OpenAI Error:', err);
      return res.status(502).json({
        error: 'AI service returned an error.',
        details: err.error?.message,
      });
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return res.status(200).json(result);
  } catch (err) {
    console.error('AI Architect Error:', err);
    return res.status(500).json({ error: 'Failed to process AI request.' });
  }
}
