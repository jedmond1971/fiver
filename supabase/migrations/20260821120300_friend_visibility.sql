-- Extends read access on profiles/game_results from "self only" to
-- "self or accepted friend", now that are_friends() exists.

-- Broader than are_friends(): true for a *pending* link too, not just
-- accepted. Needed so the addressee of an incoming request (and the
-- requester of an outgoing one) can see the other party's username in the
-- pending-requests list — verified locally that without this, the pending
-- list shows "(unknown)" instead of a name, since are_friends() alone (used
-- for game_results below) only recognizes accepted friendships.
create or replace function public.has_friendship_link(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships f
    where (f.requester_id = a and f.addressee_id = b)
       or (f.requester_id = b and f.addressee_id = a)
  );
$$;

drop policy "profiles_select_self" on public.profiles;
create policy "profiles_select_self_or_friend"
  on public.profiles for select
  using (id = auth.uid() or public.has_friendship_link(auth.uid(), id));

drop policy "game_results_select_self" on public.game_results;
create policy "game_results_select_self_or_friend"
  on public.game_results for select
  using (user_id = auth.uid() or public.are_friends(auth.uid(), user_id));

-- Friend discovery ("add friend by username or email") needs to look up
-- users who aren't friends yet, which the policy above deliberately does not
-- allow. This SECURITY DEFINER function is the one sanctioned bypass: it
-- exposes only id + username (never email, avatar, or stats) for a
-- prefix/exact match, and never returns the caller's own row.
create or replace function public.search_profile(query text)
returns table (id uuid, username text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.id, p.username
  from public.profiles p
  left join auth.users u on u.id = p.id
  where p.id <> auth.uid()
    and (p.username ilike query || '%' or u.email = query)
  limit 10;
$$;

revoke all on function public.search_profile(text) from public;
grant execute on function public.search_profile(text) to authenticated;
