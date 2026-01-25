-- ============================================
-- CORTEXIVA DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pgvector extension (if not already enabled)
create extension if not exists vector;

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies: Users can only see/edit their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 2. BOTS TABLE
-- ============================================
create table if not exists public.bots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  department text not null,
  description text,
  config jsonb default '{
    "systemPrompt": "",
    "tone": "professional",
    "welcomeMessage": "Hello! How can I help you today?",
    "confidenceThreshold": 70,
    "fallbackMessage": "I am not sure about that. Let me connect you with someone who can help.",
    "enableFollowUp": true,
    "suggestRelated": true,
    "temperature": 0.7,
    "maxTokens": 500,
    "memorySize": 5,
    "visibility": "private",
    "allowedDomain": ""
  }'::jsonb not null,
  status text default 'draft' check (status in ('draft', 'active', 'paused')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.bots enable row level security;

-- Policies: Users can only manage their own bots
create policy "Users can view own bots"
  on public.bots for select
  using (auth.uid() = user_id);

create policy "Users can create bots"
  on public.bots for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bots"
  on public.bots for update
  using (auth.uid() = user_id);

create policy "Users can delete own bots"
  on public.bots for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists bots_user_id_idx on public.bots(user_id);

-- ============================================
-- 3. KNOWLEDGE SOURCES TABLE
-- ============================================
create table if not exists public.knowledge_sources (
  id uuid default gen_random_uuid() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  type text not null check (type in ('file', 'url', 'text')),
  name text not null,
  file_path text,
  url text,
  content text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')) not null,
  metadata jsonb default '{}'::jsonb,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.knowledge_sources enable row level security;

-- Policies: Users can manage knowledge sources for their bots
create policy "Users can view own knowledge sources"
  on public.knowledge_sources for select
  using (
    exists (
      select 1 from public.bots
      where bots.id = knowledge_sources.bot_id
      and bots.user_id = auth.uid()
    )
  );

create policy "Users can create knowledge sources"
  on public.knowledge_sources for insert
  with check (
    exists (
      select 1 from public.bots
      where bots.id = knowledge_sources.bot_id
      and bots.user_id = auth.uid()
    )
  );

create policy "Users can update own knowledge sources"
  on public.knowledge_sources for update
  using (
    exists (
      select 1 from public.bots
      where bots.id = knowledge_sources.bot_id
      and bots.user_id = auth.uid()
    )
  );

create policy "Users can delete own knowledge sources"
  on public.knowledge_sources for delete
  using (
    exists (
      select 1 from public.bots
      where bots.id = knowledge_sources.bot_id
      and bots.user_id = auth.uid()
    )
  );

-- Index for faster queries
create index if not exists knowledge_sources_bot_id_idx on public.knowledge_sources(bot_id);

-- ============================================
-- 4. EMBEDDINGS TABLE (pgvector)
-- ============================================
create table if not exists public.embeddings (
  id uuid default gen_random_uuid() primary key,
  source_id uuid references public.knowledge_sources(id) on delete cascade not null,
  bot_id uuid references public.bots(id) on delete cascade not null,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.embeddings enable row level security;

-- Policies: Users can view embeddings for their bots
create policy "Users can view own embeddings"
  on public.embeddings for select
  using (
    exists (
      select 1 from public.bots
      where bots.id = embeddings.bot_id
      and bots.user_id = auth.uid()
    )
  );

create policy "Users can create embeddings"
  on public.embeddings for insert
  with check (
    exists (
      select 1 from public.bots
      where bots.id = embeddings.bot_id
      and bots.user_id = auth.uid()
    )
  );

create policy "Users can delete own embeddings"
  on public.embeddings for delete
  using (
    exists (
      select 1 from public.bots
      where bots.id = embeddings.bot_id
      and bots.user_id = auth.uid()
    )
  );

-- Indexes for vector similarity search
create index if not exists embeddings_bot_id_idx on public.embeddings(bot_id);
create index if not exists embeddings_source_id_idx on public.embeddings(source_id);

-- HNSW index for fast vector search (better than IVFFlat for accuracy)
create index if not exists embeddings_embedding_idx on public.embeddings
  using hnsw (embedding vector_cosine_ops);

-- ============================================
-- 5. CHATS TABLE
-- ============================================
create table if not exists public.chats (
  id uuid default gen_random_uuid() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  session_id text not null,
  messages jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chats enable row level security;

-- Policies: Users can view their own chats, bot owners can view all chats for their bots
create policy "Users can view own chats"
  on public.chats for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.bots
      where bots.id = chats.bot_id
      and bots.user_id = auth.uid()
    )
  );

create policy "Anyone can create chats"
  on public.chats for insert
  with check (true);

create policy "Users can update own chats"
  on public.chats for update
  using (
    auth.uid() = user_id
    or session_id is not null
  );

-- Indexes
create index if not exists chats_bot_id_idx on public.chats(bot_id);
create index if not exists chats_user_id_idx on public.chats(user_id);
create index if not exists chats_session_id_idx on public.chats(session_id);

-- ============================================
-- 6. VECTOR SIMILARITY SEARCH FUNCTION
-- ============================================
create or replace function match_embeddings(
  query_embedding vector(1536),
  match_bot_id uuid,
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    embeddings.id,
    embeddings.content,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from public.embeddings
  where embeddings.bot_id = match_bot_id
    and 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_bots_updated_at on public.bots;
create trigger handle_bots_updated_at
  before update on public.bots
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_knowledge_sources_updated_at on public.knowledge_sources;
create trigger handle_knowledge_sources_updated_at
  before update on public.knowledge_sources
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_chats_updated_at on public.chats;
create trigger handle_chats_updated_at
  before update on public.chats
  for each row execute function public.handle_updated_at();

-- ============================================
-- 8. STORAGE BUCKET FOR FILE UPLOADS
-- ============================================
-- Note: Run this separately or via Supabase Dashboard
-- insert into storage.buckets (id, name, public)
-- values ('knowledge-files', 'knowledge-files', false);
