import type { GameResult, Stats } from './types';

export const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
};

/** Folds one completed game into a running Stats total. */
export function applyResultToStats(prev: Stats, won: boolean, guessCount: number): Stats {
  const distribution = [...prev.distribution];
  if (won) distribution[guessCount - 1] += 1;
  const currentStreak = won ? prev.currentStreak + 1 : 0;
  return {
    played: prev.played + 1,
    wins: prev.wins + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(prev.maxStreak, currentStreak),
    distribution,
  };
}

/**
 * Derives a Stats total from a user's game_results rows. Results are folded
 * in puzzle_number order so streaks match the same "resets on loss" semantics
 * as the local guest Stats reducer — not calendar-day adjacency.
 */
export function deriveStatsFromResults(results: readonly GameResult[]): Stats {
  const ordered = [...results].sort((a, b) => a.puzzleNumber - b.puzzleNumber);
  return ordered.reduce(
    (stats, result) => applyResultToStats(stats, result.won, result.guessCount ?? 6),
    EMPTY_STATS,
  );
}
