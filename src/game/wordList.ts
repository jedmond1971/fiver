// valid-guesses.json: the ~14,855-word accept list of all five-letter words
// Wordle allows as guesses, mirrored from tabatkins/wordle-list
// (github.com/tabatkins/wordle-list, MIT licensed), unioned with the answer
// list so every possible answer is itself always a valid guess.
//
// The answer list itself (answers.json) is deliberately NOT imported here or
// anywhere else under src/ — it's server-only (see api/_lib/answers.ts) so
// the daily word is never shipped in the client bundle. Scoring happens via
// the /api/guess endpoint instead of a local evaluateGuess(guess, answer) call.
import validGuessesData from '../data/valid-guesses.json' with { type: 'json' };

const VALID_GUESSES: ReadonlySet<string> = new Set(validGuessesData as string[]);

export function isValidGuess(word: string): boolean {
  return VALID_GUESSES.has(word.toLowerCase());
}
