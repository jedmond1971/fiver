-- FIVER-10: search_profile only matched a username *prefix* and an exact,
-- case-sensitive email, so most partial/differently-cased searches silently
-- returned zero rows (no error — just an empty result set). Widen the
-- username match to substring, and make the email match case-insensitive.
--
-- Email is deliberately kept as an *exact* match rather than widened to
-- substring like username: this function is a security-definer bypass that
-- can confirm/deny a specific email belongs to an account, and a partial
-- match would let it be used to enumerate registered emails by probing
-- fragments. That tradeoff matters more now that FIVER-9 is about to put a
-- "search by email" box in front of more users to invite them.
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
    and (p.username ilike '%' || query || '%' or lower(u.email) = lower(query))
  limit 10;
$$;
