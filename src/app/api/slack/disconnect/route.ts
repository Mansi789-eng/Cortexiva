import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revokeToken } from '@/lib/slack';

// POST /api/slack/disconnect - Disconnect Slack from a bot
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { botId } = body;

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
      .select('id, user_id, slack_access_token, slack_channels')
      .eq('id', botId)
      .single();

    if (!bot || bot.user_id !== user.id) {
      return NextResponse.json({ error: 'Bot not found or access denied' }, { status: 404 });
    }

    // Revoke token if exists
    if (bot.slack_access_token) {
      try {
        await revokeToken(bot.slack_access_token);
      } catch (e) {
        console.error('Failed to revoke Slack token:', e);
        // Continue anyway - we still want to clear local data
      }
    }

    // Delete all Slack knowledge sources for this bot
    const { error: deleteSourcesError } = await supabase
      .from('knowledge_sources')
      .delete()
      .eq('bot_id', botId)
      .eq('type', 'slack');

    if (deleteSourcesError) {
      console.error('Failed to delete Slack knowledge sources:', deleteSourcesError);
    }

    // Delete all embeddings from Slack sources
    // (This should cascade from knowledge_sources deletion if foreign key is set up correctly)

    // Clear Slack connection from bot
    const { error: updateError } = await supabase
      .from('bots')
      .update({
        slack_team_id: null,
        slack_team_name: null,
        slack_access_token: null,
        slack_channels: [],
      })
      .eq('id', botId);

    if (updateError) {
      console.error('Failed to clear Slack connection:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect Slack' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Slack:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Slack' },
      { status: 500 }
    );
  }
}
