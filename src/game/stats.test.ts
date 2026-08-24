import { describe, expect, it } from 'vitest';
import { applyResultToStats, deriveStatsFromResults, EMPTY_STATS } from './stats';
import type { GameResult } from './types';

function result(overrides: Partial<GameResult>): GameResult {
  return {
    id: 'id',
    userId: 'user',
    puzzleNumber: 1,
    guessCount: null,
    won: false,
    guesses: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('applyResultToStats', () => {
  it('increments played and wins, and buckets a win by guess count', () => {
    const next = applyResultToStats(EMPTY_STATS, true, 3);
    expect(next.played).toBe(1);
    expect(next.wins).toBe(1);
    expect(next.currentStreak).toBe(1);
    expect(next.maxStreak).toBe(1);
    expect(next.distribution).toEqual([0, 0, 1, 0, 0, 0]);
  });

  it('resets currentStreak but keeps maxStreak on a loss', () => {
    const afterTwoWins = applyResultToStats(applyResultToStats(EMPTY_STATS, true, 2), true, 4);
    const afterLoss = applyResultToStats(afterTwoWins, false, 6);
    expect(afterLoss.played).toBe(3);
    expect(afterLoss.wins).toBe(2);
    expect(afterLoss.currentStreak).toBe(0);
    expect(afterLoss.maxStreak).toBe(2);
  });
});

describe('deriveStatsFromResults', () => {
  it('folds results in puzzle_number order regardless of array order', () => {
    // Out of order on purpose: a win (puzzle 2) then a loss (puzzle 3) then a
    // win (puzzle 1) — chronologically win, loss, win, so the final streak
    // should be 1, not derived from array order.
    const results: GameResult[] = [
      result({ puzzleNumber: 2, won: true, guessCount: 3 }),
      result({ puzzleNumber: 3, won: false, guessCount: null }),
      result({ puzzleNumber: 1, won: true, guessCount: 2 }),
    ];
    const stats = deriveStatsFromResults(results);
    expect(stats.played).toBe(3);
    expect(stats.wins).toBe(2);
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(2);
  });

  it('returns EMPTY_STATS for no results', () => {
    expect(deriveStatsFromResults([])).toEqual(EMPTY_STATS);
  });
});
