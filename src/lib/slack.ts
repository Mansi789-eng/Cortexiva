// Slack Web API helpers for knowledge source integration

const SLACK_API_BASE = 'https://slack.com/api';

export interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  team?: {
    id: string;
    name: string;
  };
  error?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
  num_members?: number;
}

export interface SlackChannelsResponse {
  ok: boolean;
  channels?: SlackChannel[];
  error?: string;
  response_metadata?: {
    next_cursor?: string;
  };
}

export interface SlackMessage {
  type: string;
  user?: string;
  text: string;
  ts: string;
  thread_ts?: string;
}

export interface SlackHistoryResponse {
  ok: boolean;
  messages?: SlackMessage[];
  has_more?: boolean;
  error?: string;
  response_metadata?: {
    next_cursor?: string;
  };
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<SlackOAuthResponse> {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Slack client credentials not configured');
  }

  const response = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  return response.json();
}

/**
 * Revoke an access token
 */
export async function revokeToken(token: string): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch(`${SLACK_API_BASE}/auth.revoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.json();
}

/**
 * List all public channels in the workspace
 */
export async function listChannels(token: string): Promise<SlackChannel[]> {
  const allChannels: SlackChannel[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({
      types: 'public_channel',
      exclude_archived: 'true',
      limit: '200',
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await fetch(`${SLACK_API_BASE}/conversations.list?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: SlackChannelsResponse = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Failed to list channels');
    }

    if (data.channels) {
      allChannels.push(...data.channels);
    }

    cursor = data.response_metadata?.next_cursor;
  } while (cursor);

  return allChannels;
}

/**
 * Join a channel (required before reading history)
 */
export async function joinChannel(token: string, channelId: string): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch(`${SLACK_API_BASE}/conversations.join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel: channelId }),
  });

  return response.json();
}

/**
 * Fetch all messages from a channel (all time)
 */
export async function fetchChannelHistory(
  token: string,
  channelId: string,
  oldestTs?: string
): Promise<SlackMessage[]> {
  const allMessages: SlackMessage[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      channel: channelId,
      limit: '200',
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    if (oldestTs) {
      params.append('oldest', oldestTs);
    }

    const response = await fetch(`${SLACK_API_BASE}/conversations.history?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: SlackHistoryResponse = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch channel history');
    }

    if (data.messages) {
      // Filter out bot messages and system messages, keep user messages
      const userMessages = data.messages.filter(
        (msg) => msg.type === 'message' && msg.user && msg.text && !msg.text.startsWith('<@')
      );
      allMessages.push(...userMessages);
    }

    hasMore = data.has_more || false;
    cursor = data.response_metadata?.next_cursor;

    // Rate limiting: wait 100ms between requests
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allMessages;
}

/**
 * Format Slack messages into readable text for knowledge base
 */
export function formatMessagesForKnowledge(messages: SlackMessage[], channelName: string): string {
  if (messages.length === 0) {
    return '';
  }

  // Group messages by date
  const messagesByDate: Record<string, SlackMessage[]> = {};

  for (const msg of messages) {
    const date = new Date(parseFloat(msg.ts) * 1000).toISOString().split('T')[0];
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(msg);
  }

  // Format as readable text
  const sections: string[] = [];

  for (const [date, msgs] of Object.entries(messagesByDate).sort()) {
    const formattedMsgs = msgs
      .map((msg) => `- ${msg.text}`)
      .join('\n');

    sections.push(`## #${channelName} - ${date}\n\n${formattedMsgs}`);
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Generate OAuth install URL
 */
export function getOAuthInstallUrl(botId: string, redirectUri: string): string {
  const clientId = process.env.SLACK_CLIENT_ID;

  if (!clientId) {
    throw new Error('SLACK_CLIENT_ID not configured');
  }

  const scopes = ['channels:read', 'channels:history', 'channels:join'].join(',');
  const state = Buffer.from(JSON.stringify({ botId })).toString('base64');

  return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
}

/**
 * Parse state from OAuth callback
 */
export function parseOAuthState(state: string): { botId: string } | null {
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
