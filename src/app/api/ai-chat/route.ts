import { NextRequest, NextResponse } from 'next/server';

// Note: In production, you would configure this with your AI provider
// Options: OpenAI, Anthropic, Google Gemini, etc.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    // Check for API key - you can configure this in production
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      // Return a mock response when no API key is configured
      return NextResponse.json({
        content: `AI 功能需要配置 API Key 才能正常工作。\n\n请设置以下环境变量之一：\n- OPENAI_API_KEY\n- ANTHROPIC_API_KEY\n\n或者使用内置的离线回复功能。`,
      });
    }

    // Example OpenAI API call (uncomment and configure in production):
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return NextResponse.json({
      content: data.choices?.[0]?.message?.content || 'No response',
    });
    */

    // Default fallback
    return NextResponse.json({
      content: 'AI 功能已就绪！请配置 API Key 以获得更好的体验。',
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
