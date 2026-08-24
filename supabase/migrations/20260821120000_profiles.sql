-- profiles: one row per signed-in FIVER player, created on first sign-in
-- once the player has chosen a username (see src/auth/AuthProvider.tsx).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  -- One-time snapshot of a guest's local Stats at the moment they signed up.
  -- Display-only baseline ("N games played before you signed in") — never
  -- merged into the live Stats derived from game_results (see stats.ts).
  legacy_stats jsonb,
  created_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 2 and 24),
  constraint profiles_username_charset check (username ~ '^[a-zA-Z0-9_]+$')
);

alter table public.profiles enable row level security;

-- RLS restricts *rows*; the base table grant below is still required or
-- `authenticated` can't touch the table at all (verified locally: a fresh
-- `supabase start` project does not grant select/insert/update on new public
-- tables by default — only truncate/references/trigger — so every query
-- fails before RLS is even evaluated without this).
grant select, insert, update on public.profiles to authenticated;

-- Extended in 20260821120300_friend_visibility.sql to also allow accepted
-- friends to read each other's profile.
create policy "profiles_select_self"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
