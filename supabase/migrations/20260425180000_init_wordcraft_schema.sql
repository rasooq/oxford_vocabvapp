-- Enable UUID generation helper
create extension if not exists pgcrypto;

-- 1) profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  learning_language text default 'en',
  native_language text default 'tr',
  target_level text,
  daily_goal integer default 10,
  created_at timestamptz default now()
);

-- 2) words
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  language_code text not null default 'en',
  cefr_level text not null,
  turkish_meaning text not null,
  word_type text not null,
  example_sentence text,
  example_sentence_tr text,
  source_tag text default 'cefr_core',
  is_active boolean default true,
  created_at timestamptz default now(),
  constraint words_language_code_word_key unique (language_code, word)
);

-- 3) practice_sessions
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  word_count integer not null,
  status text default 'started',
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- 4) user_words
create table if not exists public.user_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  word_id uuid references public.words(id) on delete cascade,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  times_seen integer default 1,
  status text default 'practiced',
  last_score text,
  created_at timestamptz default now(),
  constraint user_words_user_id_word_id_key unique (user_id, word_id)
);

-- 5) sentence_attempts
create table if not exists public.sentence_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.practice_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  word_id uuid references public.words(id) on delete cascade,
  user_sentence text not null,
  corrected_sentence text,
  explanation_tr text,
  better_example_sentence text,
  short_tip_tr text,
  score text,
  is_sentence_valid boolean,
  is_word_used_correctly boolean,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_profiles_id on public.profiles(id);
create index if not exists idx_words_language_code_cefr_level on public.words(language_code, cefr_level);
create index if not exists idx_practice_sessions_user_id on public.practice_sessions(user_id);
create index if not exists idx_user_words_user_id on public.user_words(user_id);
create index if not exists idx_user_words_word_id on public.user_words(word_id);
create index if not exists idx_sentence_attempts_user_id on public.sentence_attempts(user_id);
create index if not exists idx_sentence_attempts_session_id on public.sentence_attempts(session_id);
create index if not exists idx_sentence_attempts_word_id on public.sentence_attempts(word_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.words enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.user_words enable row level security;
alter table public.sentence_attempts enable row level security;

-- profiles: users can select/update/insert only their own profile
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- words: authenticated users can select active words
create policy "words_select_active"
  on public.words
  for select
  to authenticated
  using (is_active = true);

-- practice_sessions: users can select/insert/update only their own sessions
create policy "practice_sessions_select_own"
  on public.practice_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "practice_sessions_insert_own"
  on public.practice_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "practice_sessions_update_own"
  on public.practice_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_words: users can select/insert/update only their own rows
create policy "user_words_select_own"
  on public.user_words
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_words_insert_own"
  on public.user_words
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_words_update_own"
  on public.user_words
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sentence_attempts: users can select/insert/update only their own rows
create policy "sentence_attempts_select_own"
  on public.sentence_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "sentence_attempts_insert_own"
  on public.sentence_attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "sentence_attempts_update_own"
  on public.sentence_attempts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create profile row for every new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, learning_language, native_language, daily_goal)
  values (new.id, new.email, 'en', 'tr', 10)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
