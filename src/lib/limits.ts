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

// Base limits for free tier
export const FREE_TIER_LIMITS: TierLimits = {
  bots: 1,
  knowledgeSourcesPerBot: 3,
  totalChats: 50, // Lifetime total
  seats: 1,
  branding: true,
};

// Plus tier limits (per-unit)
export const PLUS_TIER_BASE = {
  knowledgeSourcesPerBot: 20,
  chatsPerSeat: 1000, // Per seat per month
  branding: false,
};

// Profile subscription data
export interface ProfileSubscription {
  tier: Tier;
  starter_paid: boolean;
  plus_bots: number;
  plus_seats: number;
}

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
 * Get user's profile with subscription data
 */
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileSubscription | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, starter_paid, plus_bots, plus_seats')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  return {
    tier: (profile.tier as Tier) || 'free',
    starter_paid: profile.starter_paid ?? false,
    plus_bots: profile.plus_bots ?? 0,
    plus_seats: profile.plus_seats ?? 0,
  };
}

/**
 * Get user's tier from profile (backwards compatible)
 */
export async function getUserTier(
  supabase: SupabaseClient,
  userId: string
): Promise<Tier> {
  const profile = await getUserProfile(supabase, userId);
  return profile?.tier || 'free';
}

/**
 * Get effective limits for a user based on tier and subscription
 */
export function getEffectiveLimits(profile: ProfileSubscription): TierLimits {
  if (profile.tier === 'plus') {
    return {
      bots: profile.plus_bots || 1,
      knowledgeSourcesPerBot: PLUS_TIER_BASE.knowledgeSourcesPerBot,
      totalChats: (profile.plus_seats || 1) * PLUS_TIER_BASE.chatsPerSeat,
      seats: profile.plus_seats || 1,
      branding: PLUS_TIER_BASE.branding,
    };
  }
  return FREE_TIER_LIMITS;
}

/**
 * Check if user can create a new bot
 */
export async function checkBotLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<LimitCheckResult> {
  const profile = await getUserProfile(supabase, userId);
  if (!profile) {
    return { allowed: false, current: 0, limit: 0, message: 'Profile not found' };
  }

  const limits = getEffectiveLimits(profile);

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
      message: profile.tier === 'free'
        ? 'Free tier allows only 1 bot. Upgrade to Plus for more bots.'
        : `You have ${limits.bots} bot(s) in your subscription. Add more bots to create another.`,
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
  const profile = await getUserProfile(supabase, userId);
  if (!profile) {
    return { allowed: false, current: 0, limit: 0, message: 'Profile not found' };
  }

  const limits = getEffectiveLimits(profile);

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
      message: profile.tier === 'free'
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
 * For plus tier: 1000 per seat per month
 */
export async function checkChatLimit(
  supabase: SupabaseClient,
  userId: string,
  botId: string
): Promise<LimitCheckResult> {
  // Get bot owner to check their tier (for public bots)
  const { data: bot } = await supabase
    .from('bots')
    .select('user_id')
    .eq('id', botId)
    .single();

  if (!bot) {
    return { allowed: false, current: 0, limit: 0, message: 'Bot not found' };
  }

  const ownerProfile = await getUserProfile(supabase, bot.user_id);
  if (!ownerProfile) {
    return { allowed: false, current: 0, limit: 0, message: 'Owner profile not found' };
  }

  const limits = getEffectiveLimits(ownerProfile);

  // Count total messages for this bot owner
  // For free tier: count ALL messages ever (lifetime)
  // For plus tier: count messages this month
  let totalMessages = 0;

  if (ownerProfile.tier === 'free') {
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

  if (totalMessages >= limits.totalChats) {
    return {
      allowed: false,
      current: totalMessages,
      limit: limits.totalChats,
      message: ownerProfile.tier === 'free'
        ? 'Free tier limit of 50 chats reached. Upgrade to Plus for more capacity.'
        : 'Monthly chat limit reached. Add more seats for additional chat capacity.',
    };
  }

  return {
    allowed: true,
    current: totalMessages,
    limit: limits.totalChats,
  };
}

/**
 * Check if user has paid the €1 starter fee
 */
export async function checkStarterPayment(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const profile = await getUserProfile(supabase, userId);
  return profile?.starter_paid ?? false;
}

/**
 * Get usage summary for a user
 */
export async function getUsageSummary(
  supabase: SupabaseClient,
  userId: string
) {
  const profile = await getUserProfile(supabase, userId);
  if (!profile) {
    return null;
  }

  const limits = getEffectiveLimits(profile);

  // Count bots
  const { count: botCount } = await supabase
    .from('bots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Count total chats (this month for plus, lifetime for free)
  const { data: userBots } = await supabase
    .from('bots')
    .select('id')
    .eq('user_id', userId);

  const botIds = userBots?.map(b => b.id) || [];
  let totalChats = 0;

  if (botIds.length > 0) {
    if (profile.tier === 'plus') {
      // Plus: this month only
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: chats } = await supabase
        .from('chats')
        .select('messages, updated_at')
        .in('bot_id', botIds)
        .gte('updated_at', startOfMonth.toISOString());

      totalChats = chats?.reduce((acc, chat) => {
        const userMessages = (chat.messages as Array<{ role: string }>)?.filter(
          m => m.role === 'user'
        ).length || 0;
        return acc + userMessages;
      }, 0) || 0;
    } else {
      // Free: lifetime
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
  }

  return {
    profile,
    limits,
    usage: {
      bots: botCount || 0,
      chats: totalChats,
    },
  };
}
