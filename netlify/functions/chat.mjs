/**
 * Netlify Function — /api/chat
 * Proxies chat requests to the OpenAI API.
 * Requires OPENAI_API_KEY set in Netlify environment variables.
 */
export default async (request) => {
  // Only accept POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno?.env?.get?.('OPENAI_API_KEY') ?? process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { messages, userMessage } = await request.json();

    if (!userMessage || typeof userMessage !== 'string') {
      return new Response(
        JSON.stringify({ error: 'userMessage is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
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

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Chat function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const config = {
  path: '/api/chat',
};
