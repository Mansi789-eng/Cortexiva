import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listChannels } from '@/lib/slack';

// GET /api/slack/channels?botId=xxx - List available Slack channels
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
      .select('id, user_id, slack_access_token, slack_channels')
      .eq('id', botId)
      .single();

    if (!bot || bot.user_id !== user.id) {
      return NextResponse.json({ error: 'Bot not found or access denied' }, { status: 404 });
    }

    if (!bot.slack_access_token) {
      return NextResponse.json({ error: 'Slack not connected' }, { status: 400 });
    }

    // Fetch channels from Slack
    const channels = await listChannels(bot.slack_access_token);

    // Mark channels that are already synced
    const syncedChannelIds = new Set(
      (bot.slack_channels || []).map((c: { id: string }) => c.id)
    );

    const channelsWithStatus = channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      is_private: channel.is_private,
      num_members: channel.num_members,
      is_synced: syncedChannelIds.has(channel.id),
      synced_info: (bot.slack_channels || []).find((c: { id: string }) => c.id === channel.id),
    }));

    return NextResponse.json({ channels: channelsWithStatus });
  } catch (error) {
    console.error('Error listing Slack channels:', error);
    return NextResponse.json(
      { error: 'Failed to list channels' },
      { status: 500 }
    );
  }
}
