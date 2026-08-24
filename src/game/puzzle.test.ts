import { describe, expect, it } from 'vitest';
import { dateFromPuzzleNumber, getPuzzleInfo } from './puzzle';

describe('dateFromPuzzleNumber', () => {
  it('is the inverse of getPuzzleInfo for a range of dates', () => {
    for (let i = 0; i < 400; i += 37) {
      const now = new Date(2025, 0, 1 + i, 15, 30);
      const { puzzleNumber, puzzleDate } = getPuzzleInfo(now);
      expect(dateFromPuzzleNumber(puzzleNumber).getTime()).toBe(puzzleDate.getTime());
    }
  });

  it('maps puzzle 1 to the epoch', () => {
    expect(dateFromPuzzleNumber(1)).toEqual(new Date(2025, 0, 1));
  });
});
