import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import {
  acceptFriendRequest,
  fetchFriendships,
  fetchLeaderboard,
  inviteFriend,
  removeFriendship,
  searchProfiles,
  sendFriendRequest,
  type InviteErrorCode,
} from '../game/remoteStorage';
import type { Friendship, LeaderboardEntry, LeaderboardMetric, LeaderboardWindow } from '../game/types';
import { CloseIcon } from './icons/CloseIcon';

interface LeaderboardModalProps {
  onClose: () => void;
  onRequestSignIn: () => void;
}

const METRICS: { key: LeaderboardMetric; label: string }[] = [
  { key: 'streak', label: 'Streak' },
  { key: 'winPct', label: 'Win %' },
  { key: 'played', label: 'Played' },
];

function metricValue(entry: LeaderboardEntry, metric: LeaderboardMetric): number {
  if (metric === 'streak') return entry.stats.currentStreak;
  if (metric === 'played') return entry.stats.played;
  return entry.stats.played > 0 ? Math.round((entry.stats.wins / entry.stats.played) * 100) : 0;
}

export function LeaderboardModal({ onClose, onRequestSignIn }: LeaderboardModalProps) {
  const { user, profile } = useAuth();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fiver-scrim" onClick={onClose}>
      <div
        className="fiver-leaderboard-card"
        role="dialog"
        aria-modal="true"
        aria-label="Leaderboard"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="fiver-leaderboard-card__close" onClick={onClose} aria-label="Close" ref={closeButtonRef}>
          <CloseIcon />
        </button>
        <div className="fiver-help-card__title">Friends</div>

        {!user || !profile ? (
          <>
            <p className="fiver-help-card__text">Sign in to add friends and see how your streak stacks up.</p>
            <button
              type="button"
              className="fiver-share-button"
              onClick={() => {
                onClose();
                onRequestSignIn();
              }}
            >
              Sign in
            </button>
          </>
        ) : (
          <LeaderboardBody userId={user.id} username={profile.username} />
        )}
      </div>
    </div>
  );
}

function LeaderboardBody({ userId, username }: { userId: string; username: string }) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [metric, setMetric] = useState<LeaderboardMetric>('streak');
  const [windowValue, setWindowValue] = useState<LeaderboardWindow>('all-time');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sent' | InviteErrorCode>('idle');

  const refresh = useCallback(() => {
    fetchFriendships(userId)
      .then(setFriendships)
      .catch(() => setError('Could not load friends.'));
  }, [userId]);

  useEffect(refresh, [refresh]);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(userId, username, windowValue)
      .then((result) => {
        if (!cancelled) setEntries(result);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the leaderboard.');
      });
    return () => {
      cancelled = true;
    };
  }, [userId, username, windowValue, friendships]);

  const runSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    try {
      const results = await searchProfiles(query);
      const knownIds = new Set(friendships.map((f) => f.otherProfile.id));
      setSearchResults(results.filter((r) => !knownIds.has(r.id)));
      setHasSearched(true);
    } catch {
      setError('Search failed.');
    } finally {
      setSearching(false);
    }
  }, [query, friendships]);

  const trimmedQuery = query.trim();
  const showInviteOption =
    hasSearched && !searching && searchResults.length === 0 && trimmedQuery.includes('@');

  const incoming = friendships.filter((f) => f.status === 'pending' && f.addresseeId === userId);
  const outgoing = friendships.filter((f) => f.status === 'pending' && f.requesterId === userId);

  const sorted = entries
    ? [...entries].sort((a, b) => metricValue(b, metric) - metricValue(a, metric))
    : null;

  return (
    <>
      {error && <div className="fiver-form-error">{error}</div>}

      <div className="fiver-friend-search">
        <input
          className="fiver-field__input"
          type="text"
          placeholder="Search by username or email"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHasSearched(false);
            setInviteStatus('idle');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void runSearch();
            }
          }}
        />
        <button type="button" className="fiver-share-button" onClick={() => void runSearch()} disabled={searching}>
          {searching ? '…' : 'Search'}
        </button>
      </div>

      {showInviteOption && (
        <div>
          {inviteStatus === 'idle' && (
            <>
              <p className="fiver-help-card__text">No FIVER player found for {trimmedQuery}.</p>
              <button
                type="button"
                className="fiver-share-button"
                disabled={inviting}
                onClick={async () => {
                  setInviting(true);
                  try {
                    const result = await inviteFriend(trimmedQuery);
                    setInviteStatus(result.ok ? 'sent' : result.error);
                  } catch {
                    setInviteStatus('unknown');
                  } finally {
                    setInviting(false);
                  }
                }}
              >
                {inviting ? '…' : 'Invite by email'}
              </button>
            </>
          )}
          {inviteStatus === 'sent' && (
            <p className="fiver-help-card__text">Invite sent! We'll email them a link to join FIVER.</p>
          )}
          {inviteStatus === 'already_registered' && (
            <p className="fiver-help-card__text">
              {trimmedQuery} already has a FIVER account — try searching for their username instead.
            </p>
          )}
          {inviteStatus === 'invalid_email' && <p className="fiver-form-error">That doesn't look like a valid email.</p>}
          {inviteStatus === 'rate_limited' && (
            <p className="fiver-form-error">Too many invites sent — try again later.</p>
          )}
          {(inviteStatus === 'unauthorized' || inviteStatus === 'unknown') && (
            <p className="fiver-form-error">Could not send invite.</p>
          )}
        </div>
      )}

      {searchResults.length > 0 && (
        <ul className="fiver-friend-list">
          {searchResults.map((r) => (
            <li key={r.id} className="fiver-friend-list__row">
              <span>{r.username}</span>
              <button
                type="button"
                className="fiver-text-button"
                disabled={busyId === r.id}
                onClick={async () => {
                  setBusyId(r.id);
                  try {
                    await sendFriendRequest(userId, r.id);
                    setSearchResults((prev) => prev.filter((p) => p.id !== r.id));
                    refresh();
                  } catch {
                    setError('Could not send request.');
                  } finally {
                    setBusyId(null);
                  }
                }}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}

      {(incoming.length > 0 || outgoing.length > 0) && (
        <>
          <div className="fiver-help-card__divider" />
          <div className="fiver-help-card__setting-title">Pending requests</div>
          <ul className="fiver-friend-list">
            {incoming.map((f) => (
              <li key={f.id} className="fiver-friend-list__row">
                <span>{f.otherProfile.username}</span>
                <span className="fiver-friend-list__actions">
                  <button
                    type="button"
                    className="fiver-text-button"
                    disabled={busyId === f.id}
                    onClick={async () => {
                      setBusyId(f.id);
                      try {
                        await acceptFriendRequest(f.id);
                        refresh();
                      } catch {
                        setError('Could not accept request.');
                      } finally {
                        setBusyId(null);
                      }
                    }}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="fiver-text-button"
                    disabled={busyId === f.id}
                    onClick={async () => {
                      setBusyId(f.id);
                      try {
                        await removeFriendship(f.id);
                        refresh();
                      } catch {
                        setError('Could not decline request.');
                      } finally {
                        setBusyId(null);
                      }
                    }}
                  >
                    Decline
                  </button>
                </span>
              </li>
            ))}
            {outgoing.map((f) => (
              <li key={f.id} className="fiver-friend-list__row">
                <span>{f.otherProfile.username}</span>
                <span className="fiver-friend-list__hint">Pending</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="fiver-help-card__divider" />

      <div className="fiver-leaderboard-controls">
        <div className="fiver-tab-group" role="tablist">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={metric === m.key}
              className={`fiver-tab${metric === m.key ? ' fiver-tab--active' : ''}`}
              onClick={() => setMetric(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="fiver-tab-group" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={windowValue === 'all-time'}
            className={`fiver-tab${windowValue === 'all-time' ? ' fiver-tab--active' : ''}`}
            onClick={() => setWindowValue('all-time')}
          >
            All time
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={windowValue === '30-day'}
            className={`fiver-tab${windowValue === '30-day' ? ' fiver-tab--active' : ''}`}
            onClick={() => setWindowValue('30-day')}
          >
            30 days
          </button>
        </div>
      </div>

      {sorted === null ? (
        <p className="fiver-help-card__text">Loading…</p>
      ) : sorted.length <= 1 ? (
        <p className="fiver-help-card__text">Add a friend above to start a leaderboard.</p>
      ) : (
        <ol className="fiver-leaderboard-list">
          {sorted.map((entry, i) => (
            <li key={entry.userId} className={`fiver-leaderboard-list__row${entry.isSelf ? ' fiver-leaderboard-list__row--self' : ''}`}>
              <span className="fiver-leaderboard-list__rank">{i + 1}</span>
              <span className="fiver-leaderboard-list__name">{entry.username}</span>
              <span className="fiver-leaderboard-list__value">
                {metricValue(entry, metric)}
                {metric === 'winPct' ? '%' : ''}
              </span>
              {!entry.isSelf && (
                <button
                  type="button"
                  className="fiver-text-button"
                  onClick={async () => {
                    const friendship = friendships.find(
                      (f) => f.status === 'accepted' && f.otherProfile.id === entry.userId,
                    );
                    if (!friendship) return;
                    setBusyId(friendship.id);
                    try {
                      await removeFriendship(friendship.id);
                      refresh();
                    } catch {
                      setError('Could not remove friend.');
                    } finally {
                      setBusyId(null);
                    }
                  }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
