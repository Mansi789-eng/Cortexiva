import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOAuthInstallUrl } from '@/lib/slack';

// GET /api/slack/install?botId=xxx - Generate OAuth install URL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    // Verify user owns this bot
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: bot } = await supabase
      .from('bots')
      .select('id, user_id')
      .eq('id', botId)
      .single();

    if (!bot || bot.user_id !== user.id) {
      return NextResponse.json({ error: 'Bot not found or access denied' }, { status: 404 });
    }

    // Generate OAuth URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/slack/oauth`;
    console.log('[Slack Install] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('[Slack Install] Using redirect_uri:', redirectUri);
    const installUrl = getOAuthInstallUrl(botId, redirectUri);

    return NextResponse.json({ url: installUrl });
  } catch (error) {
    console.error('Error generating Slack install URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate install URL' },
      { status: 500 }
    );
  }
}
