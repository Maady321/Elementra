
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const apiKey = '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';

async function testKey() {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }]
      })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

testKey();
