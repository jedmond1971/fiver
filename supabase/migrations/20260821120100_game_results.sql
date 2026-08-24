-- game_results: one row per completed puzzle per signed-in user. The
-- signed-in equivalent of the local `fiver:stats` key — Stats (played,
-- wins, streaks, distribution) is derived from this table client-side
-- (see src/game/stats.ts), never stored as a separately-maintained total.

create table public.game_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  puzzle_number integer not null,
  guess_count integer,
  won boolean not null,
  guesses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint game_results_unique_puzzle unique (user_id, puzzle_number),
  constraint game_results_guess_count_range check (guess_count is null or guess_count between 1 and 6),
  -- A win must record how many guesses it took; a loss has none.
  constraint game_results_guess_count_matches_won check (
    (won and guess_count is not null) or (not won and guess_count is null)
  )
);

create index game_results_user_id_idx on public.game_results (user_id);

alter table public.game_results enable row level security;

-- See the comment on the equivalent grant in 20260821120000_profiles.sql —
-- required in addition to RLS, not instead of it. No update/delete: results
-- are immutable once recorded.
grant select, insert on public.game_results to authenticated;

-- Extended in 20260821120300_friend_visibility.sql to also allow accepted
-- friends to read each other's results (for the leaderboard).
create policy "game_results_select_self"
  on public.game_results for select
  using (user_id = auth.uid());

create policy "game_results_insert_self"
  on public.game_results for insert
  with check (user_id = auth.uid());
