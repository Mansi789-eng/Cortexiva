'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BotData {
  id: string;
  name: string;
  department: string;
  description: string;
  status: string;
  config: {
    welcomeMessage?: string;
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

const departments: Record<string, { name: string; icon: string }> = {
  hr: { name: 'Human Resources', icon: '👥' },
  sales: { name: 'Sales', icon: '💰' },
  engineering: { name: 'Engineering', icon: '⚙️' },
  support: { name: 'Customer Support', icon: '🎧' },
  marketing: { name: 'Marketing', icon: '📣' },
  operations: { name: 'Operations', icon: '📋' },
  finance: { name: 'Finance', icon: '📊' },
  other: { name: 'Other', icon: '🤖' },
};

function TestBotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const botId = searchParams.get('id');

  const [botData, setBotData] = useState<BotData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load bot data
  useEffect(() => {
    const loadBot = async () => {
      if (!botId) {
        setError('No bot ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bots/${botId}`);
        if (!response.ok) {
          throw new Error('Bot not found');
        }
        const data = await response.json();
        setBotData(data.bot);

        // Add welcome message
        const welcomeMsg = data.bot.config?.welcomeMessage ||
          `Hello! I'm ${data.bot.name}, your ${departments[data.bot.department]?.name || 'team'} assistant. How can I help you today?`;

        setMessages([{
          id: '1',
          role: 'assistant',
          content: welcomeMsg,
          timestamp: new Date(),
        }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bot');
      } finally {
        setLoading(false);
      }
    };

    loadBot();
  }, [botId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !botId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`/api/bots/${botId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const botResponse: Message = {
        id: data.message.id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(),
        sources: data.sources,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = {
    hr: ['What is our PTO policy?', 'How do I request parental leave?', 'When are performance reviews?'],
    sales: ['What are our pricing tiers?', 'How long is the typical sales cycle?', 'How do I handle pricing objections?'],
    engineering: ['What are the API rate limits?', 'How do I deploy to production?', 'How does authentication work?'],
    support: ["I can't log in to my account", 'Where can I see my invoices?', "My data isn't syncing"],
    default: ['Tell me about company policies', 'How can I get help?', 'What services do you offer?'],
  };

  const questions = suggestedQuestions[botData?.department as keyof typeof suggestedQuestions] || suggestedQuestions.default;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Loading bot...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/create-bot-dashboard')}
            className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--card-border)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/configuration-bot?id=${botId}`)}
                className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center text-xl">
                  {botData ? departments[botData.department]?.icon : '🤖'}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                    {botData?.name || 'Test Bot'}
                  </h1>
                  <p className="text-xs text-[var(--text-muted)]">
                    {botData?.status === 'active' ? 'Live' : 'Test Mode'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                botData?.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {botData?.status === 'active' ? 'Live' : 'Draft'}
              </span>
              <button
                onClick={() => router.push(`/configuration-bot?id=${botId}`)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
              >
                Back to Config
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 overflow-y-auto">
        {/* Messages */}
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--accent-subtle)]'
                }`}
              >
                {message.role === 'user' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <span className="text-sm">{botData ? departments[botData.department]?.icon : '🤖'}</span>
                )}
              </div>

              {/* Message Content */}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-[var(--accent-primary)] text-white rounded-tr-sm'
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] rounded-tl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[var(--card-border)]">
                    <p className="text-xs text-[var(--text-muted)]">
                      Sources: {message.sources.join(', ')}
                    </p>
                  </div>
                )}
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-white/60' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex-shrink-0 flex items-center justify-center">
                <span className="text-sm">{botData ? departments[botData.department]?.icon : '🤖'}</span>
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--card-bg)] border border-[var(--card-border)]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="mt-8">
            <p className="text-sm text-[var(--text-muted)] mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="px-4 py-2 rounded-full text-sm text-[var(--text-secondary)] bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] border border-[var(--card-border)] transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-[var(--background)] border-t border-[var(--card-border)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-subtle)] resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
          {botData?.status !== 'active' && (
            <p className="text-xs text-yellow-600 text-center mt-3">
              This bot is in draft mode. Publish it to make it live.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TestBotFallback() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function TestBot() {
  return (
    <Suspense fallback={<TestBotFallback />}>
      <TestBotContent />
    </Suspense>
  );
}
