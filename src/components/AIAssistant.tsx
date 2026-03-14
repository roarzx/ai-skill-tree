'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { flattenSkills } from '@/lib/skills';
import { skillsData } from '@/lib/skills';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SYSTEM_PROMPT = `你是一个AI技能树助手，可以帮助用户：
1. 推荐学习路径 - 根据用户当前技能和目标推荐下一步
2. 解释概念 - 用通俗易懂的方式解释技术概念
3. 提供资源 - 推荐学习资料、视频、文档等
4. 制定计划 - 根据用户时间安排学习计划

用户的技能树包含以下领域：
- AI（人工智能）
  - Machine Learning（机器学习）
    - Linear Regression, SVM, Decision Tree
  - Deep Learning（深度学习）
    - CNN, RNN/LSTM, Transformer
  - LLM（大语言模型）
    - Prompt Engineering, RAG, Agent, Fine-tuning
  - AI Infra（AI基础设施）
    - vLLM, Langfuse, LlamaIndex

请用中文回复，语气友好、专业。`;

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的AI技能树助手 🤖\n\n我可以帮你：\n- 推荐学习路径\n- 解释技术概念\n- 提供学习资源\n- 制定学习计划\n\n有什么想了解的吗？',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userSkills = useStore((state) => state.userSkills);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContextInfo = () => {
    const allSkills = flattenSkills(skillsData);
    const learnedSkills = Object.entries(userSkills)
      .filter(([_, v]) => v.level !== 'not_started')
      .map(([k, v]) => {
        const skill = allSkills.find((s) => s.id === k);
        return skill ? `${skill.name} (${v.level})` : k;
      });
    
    return `用户已学习技能: ${learnedSkills.length > 0 ? learnedSkills.join(', ') : '暂无'}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 构建上下文
      const contextInfo = getContextInfo();
      const fullPrompt = `${SYSTEM_PROMPT}\n\n${contextInfo}\n\n用户问题: ${userMessage.content}`;

      // 使用兼容的 AI SDK 调用
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: `${contextInfo}\n\n${userMessage.content}` },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || '抱歉，我暂时无法回答这个问题。',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getFallbackResponse(input),
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('推荐') || q.includes('下一步') || q.includes('学习路径')) {
      return `📚 **学习路径推荐**\n\n根据你的情况，我建议：\n\n1. **如果你是初学者**：从 Machine Learning 的基础开始\n2. **如果你已入门**：可以尝试 LLM 相关的 Prompt Engineering\n3. **如果你想深入**：建议学习 Transformer 架构\n\n需要我详细解释某个领域吗？`;
    }
    
    if (q.includes('transformer') || q.includes('注意力机制')) {
      return `🔮 **Transformer 简介**\n\nTransformer 是一种基于"注意力机制"的深度学习架构：\n\n- **核心**: 自注意力机制 (Self-Attention)\n- **优势**: 并行计算、捕捉长距离依赖\n- **代表模型**: BERT, GPT, LLaMA 等\n\n是现代大语言模型的基础！`;
    }
    
    if (q.includes('rag') || q.includes('检索增强')) {
      return `📖 **RAG (检索增强生成)**\n\nRAG = 检索 + 生成\n\n**工作流程**：\n1. 将知识存入向量数据库\n2. 用户提问时，先检索相关知识\n3. 将检索结果送给 LLM 生成答案\n\n**优点**：解决 LLM 知识过时/幻觉问题`;
    }
    
    return `💡 谢谢你的问题！\n\n我目前支持以下功能：\n- 📚 学习路径推荐\n- 📖 技术概念解释\n- 🔗 学习资源推荐\n\n你可以这样问我：\n- "推荐一个学习路径"\n- "什么是 Transformer?"\n- "RAG 是什么？"\n\n注意：AI 功能需要配置 API Key 才能正常工作。`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 
                   rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30
                   hover:scale-110 transition-transform duration-200 z-50"
      >
        <Bot className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-slate-900/95 backdrop-blur-md 
                        border border-slate-700/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg 
                              flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">AI 助手</h3>
                <p className="text-xs text-slate-400">技能树智能顾问</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/50'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 border border-slate-700/50 p-3 rounded-2xl">
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入问题..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl
                           text-slate-200 placeholder-slate-500 text-sm
                           focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl
                           text-white disabled:opacity-50 disabled:cursor-not-allowed
                           hover:scale-105 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
