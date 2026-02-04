import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChatModel } from '@/lib/gemini';
import { searchWithReasoning, buildContextFromResults } from '@/lib/knowledge/tree-retriever';
import { v4 as uuidv4 } from 'uuid';
import type { BotConfig, ChatMessage, SourceInfo } from '@/lib/types/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/bots/[id]/chat - Send a message and get AI response
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: botId } = await params;
    const supabase = await createClient();

    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const chatSessionId = sessionId || uuidv4();

    // Get the bot and its config
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Note: Allow testing for any status (draft, active, paused)
    // Only block if bot is explicitly disabled in the future

    const config = bot.config as BotConfig;

    // Search for relevant context using reasoning-based retrieval (PageIndex approach)
    console.log(`[Chat] Searching for context with query: "${message}"`);
    const confidenceThreshold = config.confidenceThreshold || 70;
    const retrievalResult = await searchWithReasoning(message, botId, confidenceThreshold);
    console.log(`[Chat] Found ${retrievalResult.relevantSections.length} relevant sections`);

    // Build context from retrieval results
    const relevantContext = buildContextFromResults(retrievalResult);

    // Extract unique sources with timestamps for citation
    const sourceMap = new Map<string, SourceInfo>();
    for (const section of retrievalResult.relevantSections) {
      const existing = sourceMap.get(section.sourceName);
      // Keep the most recent update timestamp
      if (!existing || new Date(section.sourceUpdatedAt) > new Date(existing.updatedAt)) {
        sourceMap.set(section.sourceName, {
          name: section.sourceName,
          updatedAt: section.sourceUpdatedAt,
        });
      }
    }
    const sources: SourceInfo[] = Array.from(sourceMap.values());

    // Get or create chat session
    let { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('bot_id', botId)
      .eq('session_id', chatSessionId)
      .single();

    const previousMessages: ChatMessage[] = chat?.messages || [];

    // Build conversation history for context
    const conversationHistory = previousMessages
      .slice(-config.memorySize * 2) // Keep last N exchanges
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Build system prompt
    const systemPrompt = buildSystemPrompt(config, relevantContext);

    // Call Gemini
    const model = getChatModel();

    // Convert conversation history to Gemini format
    const geminiHistory = conversationHistory.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user' as const,
      parts: [{ text: m.content }],
    }));

    // Create chat with history and system instruction
    const geminiChat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 500,
      },
    });

    // Send message with system prompt context
    const fullMessage = systemPrompt + '\n\n---\n\nUser: ' + message;
    const result = await geminiChat.sendMessage(fullMessage);
    const response = await result.response;
    const assistantMessage = response.text() || config.fallbackMessage;

    // Create message objects
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const assistantMsg: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString(),
      sources,
    };

    const updatedMessages = [...previousMessages, userMsg, assistantMsg];

    // Save or update chat session
    if (chat) {
      await supabase
        .from('chats')
        .update({ messages: updatedMessages })
        .eq('id', chat.id);
    } else {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('chats').insert({
        bot_id: botId,
        user_id: user?.id || null,
        session_id: chatSessionId,
        messages: updatedMessages,
      });
    }

    return NextResponse.json({
      message: assistantMsg,
      sessionId: chatSessionId,
      sources,
      reasoning: retrievalResult.reasoning, // Include reasoning for transparency
    });
  } catch (error) {
    console.error('Error in POST /api/bots/[id]/chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// GET /api/bots/[id]/chat - Get chat history
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: botId } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get chat session
    const { data: chat, error } = await supabase
      .from('chats')
      .select('*')
      .eq('bot_id', botId)
      .eq('session_id', sessionId)
      .single();

    if (error || !chat) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      messages: chat.messages,
      sessionId: chat.session_id,
    });
  } catch (error) {
    console.error('Error in GET /api/bots/[id]/chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(config: BotConfig, context: string): string {
  const toneInstructions: Record<string, string> = {
    professional: 'Maintain a professional and authoritative tone.',
    friendly: 'Be warm, approachable, and conversational.',
    casual: 'Keep responses casual and relaxed.',
    concise: 'Be brief and to the point. Avoid unnecessary words.',
  };

  let systemPrompt = config.systemPrompt || 'You are a helpful assistant.';

  systemPrompt += `\n\n${toneInstructions[config.tone] || toneInstructions.professional}`;

  if (context) {
    systemPrompt += `

Use the following knowledge base to answer questions. Only use information from this context. If the answer is not in the context, say "${config.fallbackMessage}"

---
KNOWLEDGE BASE:
${context}
---`;
  } else {
    systemPrompt += `

If you don't have enough information to answer, respond with: "${config.fallbackMessage}"`;
  }

  if (config.suggestRelated) {
    systemPrompt += '\n\nWhen relevant, suggest related topics the user might want to explore.';
  }

  if (config.enableFollowUp) {
    systemPrompt += '\n\nIf clarification would help, ask follow-up questions.';
  }

  return systemPrompt;
}
