import { SupabaseClient } from '@supabase/supabase-js';

// ============================================
// Tier Definitions
// ============================================

export type Tier = 'free' | 'plus';

export interface TierLimits {
  bots: number;
  knowledgeSourcesPerBot: number;
  totalChats: number; // Lifetime for free, per seat/month for plus
  seats: number;
  branding: boolean;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    bots: 1,
    knowledgeSourcesPerBot: 3,
    totalChats: 50, // Lifetime total
    seats: 1,
    branding: true,
  },
  plus: {
    bots: Infinity, // Unlimited (€5/bot)
    knowledgeSourcesPerBot: 20, // Or 1000 pages
    totalChats: 1000, // Per seat per month
    seats: Infinity, // Unlimited (€2/seat)
    branding: false,
  },
};

// ============================================
// Limit Check Helpers
// ============================================

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}

/**
 * Get user's tier from profile
 */
export async function getUserTier(
  supabase: SupabaseClient,
  userId: string
): Promise<Tier> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single();

  return (profile?.tier as Tier) || 'free';
}

/**
 * Check if user can create a new bot
 */
export async function checkBotLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<LimitCheckResult> {
  const tier = await getUserTier(supabase, userId);
  const limits = TIER_LIMITS[tier];

  // Count existing bots
  const { count } = await supabase
    .from('bots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const currentCount = count || 0;

  if (currentCount >= limits.bots) {
    return {
      allowed: false,
      current: currentCount,
      limit: limits.bots,
      message: tier === 'free'
        ? 'Free tier allows only 1 bot. Upgrade to Plus for unlimited bots.'
        : 'Bot limit reached.',
    };
  }

  return {
    allowed: true,
    current: currentCount,
    limit: limits.bots,
  };
}

/**
 * Check if user can add knowledge source to a bot
 */
export async function checkKnowledgeSourceLimit(
  supabase: SupabaseClient,
  userId: string,
  botId: string
): Promise<LimitCheckResult> {
  const tier = await getUserTier(supabase, userId);
  const limits = TIER_LIMITS[tier];

  // Count existing knowledge sources for this bot
  const { count } = await supabase
    .from('knowledge_sources')
    .select('*', { count: 'exact', head: true })
    .eq('bot_id', botId);

  const currentCount = count || 0;

  if (currentCount >= limits.knowledgeSourcesPerBot) {
    return {
      allowed: false,
      current: currentCount,
      limit: limits.knowledgeSourcesPerBot,
      message: tier === 'free'
        ? 'Free tier allows only 3 knowledge sources. Upgrade to Plus for 20 sources per bot.'
        : 'Knowledge source limit reached for this bot.',
    };
  }

  return {
    allowed: true,
    current: currentCount,
    limit: limits.knowledgeSourcesPerBot,
  };
}

/**
 * Check if user can send a chat message
 * For free tier: 50 lifetime total across all bots
 * For plus tier: 1000 per seat per month (simplified: per user per month)
 */
export async function checkChatLimit(
  supabase: SupabaseClient,
  userId: string,
  botId: string
): Promise<LimitCheckResult> {
  const tier = await getUserTier(supabase, userId);
  const limits = TIER_LIMITS[tier];

  // Get bot owner to check their tier (for public bots)
  const { data: bot } = await supabase
    .from('bots')
    .select('user_id')
    .eq('id', botId)
    .single();

  if (!bot) {
    return { allowed: false, current: 0, limit: 0, message: 'Bot not found' };
  }

  const ownerTier = await getUserTier(supabase, bot.user_id);
  const ownerLimits = TIER_LIMITS[ownerTier];

  // Count total messages for this bot owner
  // For free tier: count ALL messages ever (lifetime)
  // For plus tier: count messages this month
  let totalMessages = 0;

  if (ownerTier === 'free') {
    // Count all messages across all bots owned by this user (lifetime)
    const { data: ownerBots } = await supabase
      .from('bots')
      .select('id')
      .eq('user_id', bot.user_id);

    const botIds = ownerBots?.map(b => b.id) || [];

    if (botIds.length > 0) {
      const { data: chats } = await supabase
        .from('chats')
        .select('messages')
        .in('bot_id', botIds);

      // Count all user messages (not assistant messages)
      totalMessages = chats?.reduce((acc, chat) => {
        const userMessages = (chat.messages as Array<{ role: string }>)?.filter(
          m => m.role === 'user'
        ).length || 0;
        return acc + userMessages;
      }, 0) || 0;
    }
  } else {
    // Plus tier: count this month only
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: ownerBots } = await supabase
      .from('bots')
      .select('id')
      .eq('user_id', bot.user_id);

    const botIds = ownerBots?.map(b => b.id) || [];

    if (botIds.length > 0) {
      const { data: chats } = await supabase
        .from('chats')
        .select('messages, updated_at')
        .in('bot_id', botIds)
        .gte('updated_at', startOfMonth.toISOString());

      totalMessages = chats?.reduce((acc, chat) => {
        const userMessages = (chat.messages as Array<{ role: string }>)?.filter(
          m => m.role === 'user'
        ).length || 0;
        return acc + userMessages;
      }, 0) || 0;
    }
  }

  if (totalMessages >= ownerLimits.totalChats) {
    return {
      allowed: false,
      current: totalMessages,
      limit: ownerLimits.totalChats,
      message: ownerTier === 'free'
        ? 'Free tier limit of 50 chats reached. Upgrade to Plus for 1,000 chats per seat per month.'
        : 'Monthly chat limit reached. Add more seats for additional chat capacity.',
    };
  }

  return {
    allowed: true,
    current: totalMessages,
    limit: ownerLimits.totalChats,
  };
}

/**
 * Get usage summary for a user
 */
export async function getUsageSummary(
  supabase: SupabaseClient,
  userId: string
) {
  const tier = await getUserTier(supabase, userId);
  const limits = TIER_LIMITS[tier];

  // Count bots
  const { count: botCount } = await supabase
    .from('bots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Count total chats
  const { data: userBots } = await supabase
    .from('bots')
    .select('id')
    .eq('user_id', userId);

  const botIds = userBots?.map(b => b.id) || [];
  let totalChats = 0;

  if (botIds.length > 0) {
    const { data: chats } = await supabase
      .from('chats')
      .select('messages')
      .in('bot_id', botIds);

    totalChats = chats?.reduce((acc, chat) => {
      const userMessages = (chat.messages as Array<{ role: string }>)?.filter(
        m => m.role === 'user'
      ).length || 0;
      return acc + userMessages;
    }, 0) || 0;
  }

  return {
    tier,
    limits,
    usage: {
      bots: botCount || 0,
      chats: totalChats,
    },
  };
}
