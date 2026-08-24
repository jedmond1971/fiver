-- friendships: a single row per pair (not two directional rows). `status`
-- starts 'pending' on request and moves to 'accepted' when the addressee
-- accepts. Declining/removing just deletes the row.

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  constraint friendships_no_self_friend check (requester_id <> addressee_id)
);

-- One row per unordered pair, regardless of who requested.
create unique index friendships_unique_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index friendships_requester_idx on public.friendships (requester_id);
create index friendships_addressee_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;

-- See the comment on the equivalent grant in 20260821120000_profiles.sql.
grant select, insert, update, delete on public.friendships to authenticated;

create policy "friendships_select_participant"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friendships_insert_requester"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

-- Either participant can update (e.g. addressee accepting) or delete
-- (declining a request, or either side removing an accepted friendship).
create policy "friendships_update_participant"
  on public.friendships for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friendships_delete_participant"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Used by the profiles/game_results friend-visibility policies below.
create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = a and f.addressee_id = b)
        or (f.requester_id = b and f.addressee_id = a))
  );
$$;
