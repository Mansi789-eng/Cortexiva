import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { joinChannel, fetchChannelHistory, formatMessagesForKnowledge } from '@/lib/slack';
import { buildTreeIndexFromText, getAllContent } from '@/lib/knowledge/tree-indexer';
import type { SlackChannel } from '@/lib/types/database';

// POST /api/slack/sync - Sync messages from selected Slack channels
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { botId, channelIds } = body;

    if (!botId || !channelIds || !Array.isArray(channelIds)) {
      return NextResponse.json(
        { error: 'Bot ID and channel IDs are required' },
        { status: 400 }
      );
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

    const token = bot.slack_access_token;
    const existingChannels: SlackChannel[] = bot.slack_channels || [];

    // Find channels to add and remove
    const existingChannelIds = new Set(existingChannels.map((c) => c.id));
    const newChannelIds = new Set(channelIds);

    const channelsToAdd = channelIds.filter((id: string) => !existingChannelIds.has(id));
    const channelsToRemove = existingChannels.filter((c) => !newChannelIds.has(c.id));

    // Remove knowledge sources for unchecked channels
    if (channelsToRemove.length > 0) {
      const serviceSupabase = createServiceClient();
      for (const channel of channelsToRemove) {
        // Delete knowledge source for this channel
        await serviceSupabase
          .from('knowledge_sources')
          .delete()
          .eq('bot_id', botId)
          .eq('type', 'slack')
          .like('name', `%#${channel.name}%`);
      }
    }

    // Sync new channels
    const syncResults: SlackChannel[] = [];

    for (const channelId of channelsToAdd) {
      try {
        // Join channel first (required to read history)
        await joinChannel(token, channelId);

        // Fetch all messages
        const messages = await fetchChannelHistory(token, channelId);

        if (messages.length === 0) {
          syncResults.push({
            id: channelId,
            name: channelId, // Will be updated below
            synced_at: new Date().toISOString(),
            message_count: 0,
          });
          continue;
        }

        // Get channel name from first message or default
        // We'll need to fetch channel info separately
        const channelInfo = await getChannelInfo(token, channelId);
        const channelName = channelInfo?.name || channelId;

        // Format messages as knowledge content
        const content = formatMessagesForKnowledge(messages, channelName);

        // Create knowledge source
        await createSlackKnowledgeSource(botId, channelName, content, messages.length);

        syncResults.push({
          id: channelId,
          name: channelName,
          synced_at: new Date().toISOString(),
          message_count: messages.length,
        });
      } catch (error) {
        console.error(`Error syncing channel ${channelId}:`, error);
        // Continue with other channels
      }
    }

    // Keep existing channels that are still selected (update if re-syncing)
    const keptChannels = existingChannels.filter((c) => newChannelIds.has(c.id) && !channelsToAdd.includes(c.id));

    // Update bot with new channel list
    const updatedChannels = [...keptChannels, ...syncResults];
    await supabase
      .from('bots')
      .update({ slack_channels: updatedChannels })
      .eq('id', botId);

    return NextResponse.json({
      success: true,
      channels: updatedChannels,
      added: syncResults.length,
      removed: channelsToRemove.length,
    });
  } catch (error) {
    console.error('Error syncing Slack channels:', error);
    return NextResponse.json(
      { error: 'Failed to sync channels' },
      { status: 500 }
    );
  }
}

// Re-sync a single channel (fetch new messages since last sync)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { botId, channelId } = body;

    if (!botId || !channelId) {
      return NextResponse.json(
        { error: 'Bot ID and channel ID are required' },
        { status: 400 }
      );
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

    const token = bot.slack_access_token;
    const existingChannels: SlackChannel[] = bot.slack_channels || [];
    const channelToResync = existingChannels.find((c) => c.id === channelId);

    if (!channelToResync) {
      return NextResponse.json({ error: 'Channel not found in synced list' }, { status: 404 });
    }

    // Delete existing knowledge source for this channel
    const serviceSupabase = createServiceClient();
    await serviceSupabase
      .from('knowledge_sources')
      .delete()
      .eq('bot_id', botId)
      .eq('type', 'slack')
      .like('name', `%#${channelToResync.name}%`);

    // Fetch all messages (full re-sync)
    const messages = await fetchChannelHistory(token, channelId);

    if (messages.length > 0) {
      // Format and create new knowledge source
      const content = formatMessagesForKnowledge(messages, channelToResync.name);
      await createSlackKnowledgeSource(botId, channelToResync.name, content, messages.length);
    }

    // Update channel sync info
    const updatedChannels = existingChannels.map((c) =>
      c.id === channelId
        ? { ...c, synced_at: new Date().toISOString(), message_count: messages.length }
        : c
    );

    await supabase
      .from('bots')
      .update({ slack_channels: updatedChannels })
      .eq('id', botId);

    return NextResponse.json({
      success: true,
      channel: updatedChannels.find((c) => c.id === channelId),
    });
  } catch (error) {
    console.error('Error re-syncing Slack channel:', error);
    return NextResponse.json(
      { error: 'Failed to re-sync channel' },
      { status: 500 }
    );
  }
}

// Helper: Get channel info
async function getChannelInfo(token: string, channelId: string): Promise<{ name: string } | null> {
  try {
    const response = await fetch(
      `https://slack.com/api/conversations.info?channel=${channelId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    return data.ok ? { name: data.channel.name } : null;
  } catch {
    return null;
  }
}

// Helper: Create knowledge source from Slack content
async function createSlackKnowledgeSource(
  botId: string,
  channelName: string,
  content: string,
  messageCount: number
) {
  const supabase = createServiceClient();

  try {
    console.log(`[Slack] Processing channel: #${channelName} (${messageCount} messages)`);

    // Create knowledge source record
    const { data: source, error: sourceError } = await supabase
      .from('knowledge_sources')
      .insert({
        bot_id: botId,
        type: 'slack',
        name: `Slack #${channelName}`,
        content: content.slice(0, 10000), // Preview
        status: 'processing',
        metadata: {
          progress: 30,
          step: 'Building index...',
          channelName,
          messageCount,
        },
      })
      .select()
      .single();

    if (sourceError) {
      console.error('[Slack] Error creating source:', sourceError);
      throw new Error('Failed to create knowledge source');
    }

    // Build tree index from Slack content
    console.log(`[Slack] Building tree index for #${channelName}...`);
    const treeIndex = await buildTreeIndexFromText(content, `Slack #${channelName}`);
    console.log(`[Slack] Created index with ${treeIndex.totalSections} sections`);

    // Get full content for storage
    const fullContent = getAllContent(treeIndex);

    // Update with completed index
    await supabase.from('knowledge_sources').update({
      status: 'completed',
      content: fullContent.slice(0, 10000),
      tree_index: treeIndex,
      metadata: {
        progress: 100,
        step: 'Completed',
        sectionsCount: treeIndex.totalSections,
        documentType: treeIndex.documentType,
        indexMethod: 'tree',
        channelName,
        messageCount,
      },
    }).eq('id', source.id);

    console.log(`[Slack] Successfully indexed #${channelName}`);
  } catch (error) {
    console.error('[Slack] Processing error:', error);
    throw error;
  }
}

// DELETE /api/slack/sync - Remove sync for a single channel
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { botId, channelId } = body;

    if (!botId || !channelId) {
      return NextResponse.json(
        { error: 'Bot ID and channel ID are required' },
        { status: 400 }
      );
    }

    // Verify user owns this bot
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: bot } = await supabase
      .from('bots')
      .select('id, user_id, slack_channels')
      .eq('id', botId)
      .single();

    if (!bot || bot.user_id !== user.id) {
      return NextResponse.json({ error: 'Bot not found or access denied' }, { status: 404 });
    }

    const existingChannels: SlackChannel[] = bot.slack_channels || [];
    const channelToRemove = existingChannels.find((c) => c.id === channelId);

    if (!channelToRemove) {
      return NextResponse.json({ error: 'Channel not found in synced list' }, { status: 404 });
    }

    // Delete knowledge source for this channel
    const serviceSupabase = createServiceClient();
    await serviceSupabase
      .from('knowledge_sources')
      .delete()
      .eq('bot_id', botId)
      .eq('type', 'slack')
      .like('name', `%#${channelToRemove.name}%`);

    // Remove channel from bot's channel list
    const updatedChannels = existingChannels.filter((c) => c.id !== channelId);

    await supabase
      .from('bots')
      .update({ slack_channels: updatedChannels })
      .eq('id', botId);

    return NextResponse.json({
      success: true,
      channels: updatedChannels,
    });
  } catch (error) {
    console.error('Error desyncing Slack channel:', error);
    return NextResponse.json(
      { error: 'Failed to desync channel' },
      { status: 500 }
    );
  }
}
