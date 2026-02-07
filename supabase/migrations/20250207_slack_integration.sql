-- ============================================
-- ADD SLACK INTEGRATION COLUMNS TO BOTS
-- Migration: 20250207_slack_integration
-- ============================================

-- Add slack_team_id (Slack workspace ID)
ALTER TABLE public.bots
ADD COLUMN IF NOT EXISTS slack_team_id TEXT;

-- Add slack_team_name (Slack workspace name for display)
ALTER TABLE public.bots
ADD COLUMN IF NOT EXISTS slack_team_name TEXT;

-- Add slack_access_token (OAuth token - should be encrypted in production)
ALTER TABLE public.bots
ADD COLUMN IF NOT EXISTS slack_access_token TEXT;

-- Add slack_channels (selected channels with sync info)
-- Format: [{"id": "C123", "name": "hr-policies", "synced_at": "2025-02-07T12:00:00Z", "message_count": 142}]
ALTER TABLE public.bots
ADD COLUMN IF NOT EXISTS slack_channels JSONB DEFAULT '[]'::jsonb;

-- Create index for Slack team lookups
CREATE INDEX IF NOT EXISTS bots_slack_team_id_idx
ON public.bots(slack_team_id)
WHERE slack_team_id IS NOT NULL;

-- Update knowledge_sources type constraint to include 'slack'
ALTER TABLE public.knowledge_sources
DROP CONSTRAINT IF EXISTS knowledge_sources_type_check;

ALTER TABLE public.knowledge_sources
ADD CONSTRAINT knowledge_sources_type_check
CHECK (type IN ('file', 'url', 'text', 'slack'));
