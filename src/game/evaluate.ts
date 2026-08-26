import type { EvaluatedLetter, KeyState, LetterState } from './types.ts';

/**
 * Scores a guess against the answer, letter by letter.
 *
 * Duplicate letters are handled in two passes: exact-position matches are
 * marked first and removed from the pool of remaining answer letters, then
 * leftover guess letters are checked against what's left of that pool for
 * "present" (wrong place) — anything not consumed stays "absent". This
 * mirrors standard Wordle scoring, e.g. guessing "SPEED" against "ERASE"
 * marks only one E as present even though the guess has two.
 */
export function evaluateGuess(guess: string, answer: string): EvaluatedLetter[] {
  const g = guess.toUpperCase().split('');
  const a = answer.toUpperCase().split('');
  const result: EvaluatedLetter[] = g.map((letter) => ({ letter, state: 'absent' as LetterState }));

  const remaining: Record<string, number> = {};
  a.forEach((letter, i) => {
    if (g[i] === letter) {
      result[i].state = 'correct';
    } else {
      remaining[letter] = (remaining[letter] ?? 0) + 1;
    }
  });

  g.forEach((letter, i) => {
    if (result[i].state === 'correct') return;
    if ((remaining[letter] ?? 0) > 0) {
      result[i].state = 'present';
      remaining[letter] -= 1;
    }
  });

  return result;
}

const STATE_PRIORITY: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/** Best known state per letter across every guess submitted so far, for coloring the keyboard. */
export function computeKeyboardStates(evaluations: EvaluatedLetter[][]): Record<string, KeyState> {
  const states: Record<string, KeyState> = {};
  for (const evaluation of evaluations) {
    for (const { letter, state } of evaluation) {
      const current = states[letter];
      if (!current || STATE_PRIORITY[state] > STATE_PRIORITY[current as LetterState]) {
        states[letter] = state;
      }
    }
  }
  return states;
}
