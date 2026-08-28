import { supabase } from '../lib/supabaseClient';
import { dateFromPuzzleNumber } from './puzzle';
import { deriveStatsFromResults, EMPTY_STATS } from './stats';
import type { Friendship, GameResult, LeaderboardEntry, LeaderboardWindow, Profile, Stats } from './types';

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

interface ProfileRow {
  id: string;
  username: string;
  avatar_url: string | null;
  legacy_stats: Stats | null;
  created_at: string;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    avatarUrl: row.avatar_url,
    legacyStats: row.legacy_stats,
    createdAt: row.created_at,
  };
}

interface GameResultRow {
  id: string;
  user_id: string;
  puzzle_number: number;
  guess_count: number | null;
  won: boolean;
  guesses: string[];
  created_at: string;
}

function toGameResult(row: GameResultRow): GameResult {
  return {
    id: row.id,
    userId: row.user_id,
    puzzleNumber: row.puzzle_number,
    guessCount: row.guess_count,
    won: row.won,
    guesses: row.guesses,
    createdAt: row.created_at,
  };
}

/** Returns null if no profile row exists yet for this user (first sign-in). */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await requireClient()
    .from('profiles')
    .select('id, username, avatar_url, legacy_stats, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toProfile(data as ProfileRow) : null;
}

/**
 * Creates the profile row for a user's first sign-in. If the guest had any
 * local play (`legacyStats.played > 0`), it's stashed on the profile as a
 * read-only baseline — see Profile.legacyStats — rather than synthesized
 * into fabricated per-puzzle game_results rows.
 */
export async function createProfile(userId: string, username: string, legacyStats: Stats | null): Promise<Profile> {
  const legacy = legacyStats && legacyStats.played > 0 ? legacyStats : null;
  const { data, error } = await requireClient()
    .from('profiles')
    .insert({ id: userId, username, legacy_stats: legacy })
    .select('id, username, avatar_url, legacy_stats, created_at')
    .single();
  if (error) throw error;
  return toProfile(data as ProfileRow);
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { data, error } = await requireClient().from('profiles').select('id').eq('username', username).maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function fetchGameResults(userId: string): Promise<GameResult[]> {
  const { data, error } = await requireClient()
    .from('game_results')
    .select('id, user_id, puzzle_number, guess_count, won, guesses, created_at')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as GameResultRow[]).map(toGameResult);
}

export async function fetchStats(userId: string): Promise<Stats> {
  const results = await fetchGameResults(userId);
  return deriveStatsFromResults(results);
}

/**
 * Idempotent: relies on the (user_id, puzzle_number) unique constraint so a
 * duplicate submit (e.g. a race on hard refresh right after finishing) is a
 * silent no-op rather than an error.
 */
export async function recordGameResult(
  userId: string,
  puzzleNumber: number,
  guessCount: number | null,
  won: boolean,
  guesses: string[],
): Promise<void> {
  const { error } = await requireClient()
    .from('game_results')
    .upsert(
      { user_id: userId, puzzle_number: puzzleNumber, guess_count: guessCount, won, guesses },
      { onConflict: 'user_id,puzzle_number', ignoreDuplicates: true },
    );
  if (error) throw error;
}

// ---------- Friends ----------

interface ProfileSearchRow {
  id: string;
  username: string;
}

/** Finds candidate users to friend, by username prefix or exact email. Excludes the caller. */
export async function searchProfiles(query: string): Promise<ProfileSearchRow[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const { data, error } = await requireClient().rpc('search_profile', { query: trimmed });
  if (error) throw error;
  return data as ProfileSearchRow[];
}

export type InviteErrorCode = 'invalid_email' | 'unauthorized' | 'already_registered' | 'rate_limited' | 'unknown';

export type InviteFriendResult = { ok: true } | { ok: false; error: InviteErrorCode };

/** Invites someone who doesn't yet have a FIVER account, via Supabase's built-in invite email. */
export async function inviteFriend(email: string): Promise<InviteFriendResult> {
  const client = requireClient();
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, error: 'unauthorized' };

  const res = await fetch('/api/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email }),
  });
  return (await res.json()) as InviteFriendResult;
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export async function fetchFriendships(userId: string): Promise<Friendship[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('friendships')
    .select('id, requester_id, addressee_id, status, created_at')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) throw error;

  const rows = data as FriendshipRow[];
  const otherIds = rows.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id));
  if (otherIds.length === 0) return [];

  const { data: profileRows, error: profileError } = await client
    .from('profiles')
    .select('id, username')
    .in('id', otherIds);
  if (profileError) throw profileError;
  const profileById = new Map((profileRows as ProfileSearchRow[]).map((p) => [p.id, p]));

  return rows.map((r) => {
    const otherId = r.requester_id === userId ? r.addressee_id : r.requester_id;
    const other = profileById.get(otherId);
    return {
      id: r.id,
      requesterId: r.requester_id,
      addresseeId: r.addressee_id,
      status: r.status,
      createdAt: r.created_at,
      otherProfile: other ?? { id: otherId, username: '(unknown)' },
    };
  });
}

export async function sendFriendRequest(requesterId: string, addresseeId: string): Promise<void> {
  const { error } = await requireClient()
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' });
  if (error) throw error;
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const { error } = await requireClient().from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
  if (error) throw error;
}

export async function removeFriendship(friendshipId: string): Promise<void> {
  const { error } = await requireClient().from('friendships').delete().eq('id', friendshipId);
  if (error) throw error;
}

// ---------- Leaderboard ----------

export async function fetchLeaderboard(userId: string, username: string, window: LeaderboardWindow): Promise<LeaderboardEntry[]> {
  const client = requireClient();
  const friendships = await fetchFriendships(userId);
  const friendIds = friendships.filter((f) => f.status === 'accepted').map((f) => f.otherProfile.id);
  const memberIds = [userId, ...friendIds];

  const [{ data: profileRows, error: profileError }, { data: resultRows, error: resultError }] = await Promise.all([
    client.from('profiles').select('id, username').in('id', memberIds),
    client
      .from('game_results')
      .select('id, user_id, puzzle_number, guess_count, won, guesses, created_at')
      .in('user_id', memberIds),
  ]);
  if (profileError) throw profileError;
  if (resultError) throw resultError;

  const usernameById = new Map((profileRows as ProfileSearchRow[]).map((p) => [p.id, p.username]));
  usernameById.set(userId, username);

  const cutoff = window === '30-day' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null;
  const results = (resultRows as GameResultRow[]).map(toGameResult).filter((r) => {
    if (!cutoff) return true;
    return dateFromPuzzleNumber(r.puzzleNumber) >= cutoff;
  });

  const resultsByUser = new Map<string, GameResult[]>();
  for (const r of results) {
    const list = resultsByUser.get(r.userId) ?? [];
    list.push(r);
    resultsByUser.set(r.userId, list);
  }

  return memberIds.map((id) => ({
    userId: id,
    username: usernameById.get(id) ?? '(unknown)',
    isSelf: id === userId,
    stats: deriveStatsFromResults(resultsByUser.get(id) ?? []),
  }));
}

export { EMPTY_STATS };
