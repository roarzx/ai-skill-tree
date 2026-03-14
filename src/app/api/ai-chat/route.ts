import { NextRequest, NextResponse } from 'next/server';

// MiniMax API 配置 - 使用正确的 API 端点
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const MINIMAX_MODEL = 'abab6.5s-chat';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    // 使用用户提供的 MiniMax API Key
    const apiKey = 'sk-cp-B-JycTrXj_f7kGCcqHvsnqN7V9QP2OJJ1IDQ51fLciMH7kNNB4ekOGBZ7BuoiDBx6Xww9cQ6LbSU_tShLLtPN3ehjKyn288ArPMO7QNVD2C-eCJXU5FbprY';
    
    if (!apiKey) {
      return NextResponse.json({
        content: `AI 功能需要配置 API Key 才能正常工作。`,
      });
    }

    // 过滤掉 system 消息，只保留 user 和 assistant 消息
    const filteredMessages = messages.filter((m: { role: string }) => 
      m.role === 'user' || m.role === 'assistant'
    );

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: filteredMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', response.status, errorText);
      return NextResponse.json({
        content: `API 请求失败 (${response.status}): ${errorText.substring(0, 100)}`,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.reply || '抱歉，我暂时无法回答这个问题。';
    
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
