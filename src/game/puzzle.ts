import type { PuzzleInfo } from './types';
import { ANSWERS } from './wordList';

/** Local midnight the first puzzle (No. 1) is dated. Everything is derived from this client-side. */
const EPOCH = new Date(2025, 0, 1);

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function nextLocalMidnight(from: Date = new Date()): Date {
  const d = startOfDay(from);
  d.setDate(d.getDate() + 1);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / msPerDay);
}

export function getPuzzleInfo(now: Date = new Date()): PuzzleInfo {
  const puzzleDate = startOfDay(now);
  const puzzleNumber = daysBetween(EPOCH, puzzleDate) + 1;
  const answer = ANSWERS[((puzzleNumber - 1) % ANSWERS.length + ANSWERS.length) % ANSWERS.length].toUpperCase();
  return { puzzleNumber, puzzleDate, answer };
}

/** Inverse of the puzzleNumber calculation in getPuzzleInfo — used for leaderboard date windowing. */
export function dateFromPuzzleNumber(puzzleNumber: number): Date {
  const d = new Date(EPOCH);
  d.setDate(d.getDate() + (puzzleNumber - 1));
  return d;
}

export function formatPuzzleDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
    .format(date)
    .toUpperCase()
    .replace(' ', ' ');
}
