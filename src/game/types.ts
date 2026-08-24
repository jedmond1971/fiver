export type LetterState = 'correct' | 'present' | 'absent';

export interface EvaluatedLetter {
  letter: string;
  state: LetterState;
}

export type KeyState = LetterState | 'unused';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = number of wins solved in i + 1 guesses */
  distribution: number[];
}

export interface StoredGame {
  puzzleNumber: number;
  guesses: string[];
  current: string;
  status: GameStatus;
}

export interface PuzzleInfo {
  puzzleNumber: number;
  puzzleDate: Date;
  answer: string;
}

/** A signed-in player's account row. */
export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  /**
   * One-time snapshot of a guest's local Stats at the moment they signed up,
   * kept for display only ("N games played before you signed in") — never
   * merged into the live Stats derived from game_results, since a real
   * streak can't be reconstructed from aggregate counts alone.
   */
  legacyStats: Stats | null;
  createdAt: string;
}

/** One completed puzzle recorded for a signed-in user. */
export interface GameResult {
  id: string;
  userId: string;
  puzzleNumber: number;
  guessCount: number | null;
  won: boolean;
  guesses: string[];
  createdAt: string;
}

export type FriendshipStatus = 'pending' | 'accepted';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  /** The other participant's profile, joined client-side for display. */
  otherProfile: { id: string; username: string };
}

export type LeaderboardWindow = 'all-time' | '30-day';
export type LeaderboardMetric = 'streak' | 'winPct' | 'played';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  isSelf: boolean;
  stats: Stats;
}
