import { SupabaseClient } from '@supabase/supabase-js';

// ============================================
// Free Tier Limits
// ============================================

export interface Limits {
  bots: number;
  knowledgeSourcesPerBot: number;
  branding: boolean;
}

export const FREE_LIMITS: Limits = {
  bots: 1,
  knowledgeSourcesPerBot: 3,
  branding: true,
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
 * Check if user can create a new bot
 */
export async function checkBotLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<LimitCheckResult> {
  // Count existing bots
  const { count } = await supabase
    .from('bots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const currentCount = count || 0;

  if (currentCount >= FREE_LIMITS.bots) {
    return {
      allowed: false,
      current: currentCount,
      limit: FREE_LIMITS.bots,
      message: 'You can only create 1 bot on the free plan.',
    };
  }

  return {
    allowed: true,
    current: currentCount,
    limit: FREE_LIMITS.bots,
  };
}

/**
 * Check if user can add knowledge source to a bot
 */
export async function checkKnowledgeSourceLimit(
  supabase: SupabaseClient,
  botId: string
): Promise<LimitCheckResult> {
  // Count existing knowledge sources for this bot
  const { count } = await supabase
    .from('knowledge_sources')
    .select('*', { count: 'exact', head: true })
    .eq('bot_id', botId);

  const currentCount = count || 0;

  if (currentCount >= FREE_LIMITS.knowledgeSourcesPerBot) {
    return {
      allowed: false,
      current: currentCount,
      limit: FREE_LIMITS.knowledgeSourcesPerBot,
      message: 'You can only add 3 knowledge sources per bot.',
    };
  }

  return {
    allowed: true,
    current: currentCount,
    limit: FREE_LIMITS.knowledgeSourcesPerBot,
  };
}

/**
 * Get usage summary for a user
 */
export async function getUsageSummary(
  supabase: SupabaseClient,
  userId: string
) {
  // Count bots
  const { count: botCount } = await supabase
    .from('bots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    limits: FREE_LIMITS,
    usage: {
      bots: botCount || 0,
    },
  };
}
