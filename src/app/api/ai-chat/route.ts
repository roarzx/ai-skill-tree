import { NextRequest, NextResponse } from 'next/server';

// MiniMax API 配置
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_pro';
const MINIMAX_MODEL = 'MiniMax-M2.5';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    // 优先使用用户提供的 MiniMax API Key
    const apiKey = process.env.MINIMAX_API_KEY || 'sk-cp-B-JycTrXj_f7kGCcqHvsnqN7V9QP2OJJ1IDQ51fLciMH7kNNB4ekOGBZ7BuoiDBx6Xww9cQ6LbSU_tShLLtPN3ehjKyn288ArPMO7QNVD2C-eCJXU5FbprY';
    
    if (!apiKey) {
      return NextResponse.json({
        content: `AI 功能需要配置 API Key 才能正常工作。`,
      });
    }

    // 转换消息格式给 MiniMax
    const minimaxMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: minimaxMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MiniMax API error:', error);
      return NextResponse.json({
        content: `API 请求失败: ${response.status}`,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
    
    return NextResponse.json({
      content,
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
