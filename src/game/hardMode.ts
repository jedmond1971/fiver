import { evaluateGuess } from './evaluate';

function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return `${n}${suffixes[n] ?? 'th'}`;
}

/**
 * Standard hard-mode enforcement: any letter revealed "correct" in an earlier
 * guess must stay in that position, and any letter revealed "present" must
 * appear somewhere in the new guess. Clues accumulate across all previous
 * guesses, not just the most recent one.
 *
 * Returns a toast-ready error message, or null if the guess is allowed.
 */
export function checkHardMode(guess: string, previousGuesses: string[], answer: string): string | null {
  if (previousGuesses.length === 0) return null;

  const requiredPositions: (string | null)[] = [null, null, null, null, null];
  const requiredCounts: Record<string, number> = {};

  for (const prev of previousGuesses) {
    const evaluated = evaluateGuess(prev, answer);
    const counts: Record<string, number> = {};
    evaluated.forEach(({ letter, state }, i) => {
      if (state === 'correct') requiredPositions[i] = letter;
      if (state === 'correct' || state === 'present') {
        counts[letter] = (counts[letter] ?? 0) + 1;
      }
    });
    for (const [letter, count] of Object.entries(counts)) {
      requiredCounts[letter] = Math.max(requiredCounts[letter] ?? 0, count);
    }
  }

  const g = guess.toUpperCase().split('');

  for (let i = 0; i < requiredPositions.length; i++) {
    const required = requiredPositions[i];
    if (required && g[i] !== required) {
      return `${ordinal(i + 1)} letter must be ${required}`;
    }
  }

  const guessCounts: Record<string, number> = {};
  g.forEach((letter) => {
    guessCounts[letter] = (guessCounts[letter] ?? 0) + 1;
  });
  for (const [letter, count] of Object.entries(requiredCounts)) {
    if ((guessCounts[letter] ?? 0) < count) {
      return `Guess must contain ${letter}`;
    }
  }

  return null;
}
