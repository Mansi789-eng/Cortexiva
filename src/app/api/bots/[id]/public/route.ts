import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/bots/[id]/public - Get public bot info (no auth required)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: botId } = await params;
    const supabase = createServiceClient();

    // Get the bot (using service client to bypass RLS)
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id, name, department, description, status, config')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Only return bots that are active or in draft mode (for testing)
    // In production, you might want to only allow active bots
    if (bot.status === 'paused') {
      return NextResponse.json({ error: 'Bot is currently unavailable' }, { status: 403 });
    }

    // Return public bot info (exclude sensitive data)
    return NextResponse.json({
      bot: {
        id: bot.id,
        name: bot.name,
        department: bot.department,
        description: bot.description,
        status: bot.status,
        config: {
          welcomeMessage: bot.config?.welcomeMessage,
          visibility: bot.config?.visibility || 'public',
          allowedDomain: bot.config?.allowedDomain,
          invitedEmails: bot.config?.invitedEmails || [],
          tone: bot.config?.tone,
        },
      },
    });
  } catch (error) {
    console.error('Error in GET /api/bots/[id]/public:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot' },
      { status: 500 }
    );
  }
}
