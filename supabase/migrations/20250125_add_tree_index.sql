-- ============================================
-- Add tree_index column to knowledge_sources
-- For PageIndex-style vectorless RAG
-- ============================================

-- Add tree_index JSONB column to store hierarchical document index
ALTER TABLE public.knowledge_sources
ADD COLUMN IF NOT EXISTS tree_index JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.knowledge_sources.tree_index IS 'Hierarchical tree index for PageIndex-style vectorless RAG. Contains document structure, sections, summaries, and keywords.';

-- Update the schema to also allow service role to update tree_index
-- (The existing RLS policies should already cover this via bot ownership check)

-- Optional: Create index on tree_index for faster JSON queries
-- CREATE INDEX IF NOT EXISTS knowledge_sources_tree_index_gin ON public.knowledge_sources USING gin (tree_index);
