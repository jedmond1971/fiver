// Word lists bundled locally (no network fetch at runtime):
//
// - answers.json: the curated ~2,315-word list of common five-letter answers
//   originally used by Wordle, mirrored from Kinkelin/WordleCompetition
//   (github.com/Kinkelin/WordleCompetition, data/official/shuffled_real_wordles.txt).
// - valid-guesses.json: the larger ~14,855-word accept list of all five-letter
//   words Wordle allows as guesses, mirrored from tabatkins/wordle-list
//   (github.com/tabatkins/wordle-list, MIT licensed), unioned with the answer
//   list so every possible answer is itself always a valid guess.
import answersData from '../data/answers.json';
import validGuessesData from '../data/valid-guesses.json';

export const ANSWERS: readonly string[] = answersData as string[];

const VALID_GUESSES: ReadonlySet<string> = new Set(validGuessesData as string[]);

export function isValidGuess(word: string): boolean {
  return VALID_GUESSES.has(word.toLowerCase());
}
