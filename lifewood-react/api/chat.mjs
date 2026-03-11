/**
 * Vercel Serverless Function — /api/chat
 * Proxies chat requests to the OpenAI API.
 * Requires OPENAI_API_KEY set in Vercel environment variables.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured.' });
  }

  try {
    const { messages, userMessage } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required.' });
    }

    const conversationMessages = [
      {
        role: 'system',
        content:
          "You are Lifewood's friendly AI assistant. Lifewood is an AI data technology company providing data annotation, collection, curation, and AIGC services with 20+ global offices. Be helpful, professional, and guide users toward booking demos or contacting sales when appropriate. Keep responses concise (2-3 sentences). For technical questions about services, offer to connect them with the appropriate team.",
      },
      ...(Array.isArray(messages)
        ? messages.map((m) => ({ role: m.role, content: String(m.content) }))
        : []),
      { role: 'user', content: userMessage },
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await openaiRes.json();
    const reply =
      data.choices?.[0]?.message?.content || 'I encountered an issue. Please try again.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat function error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
