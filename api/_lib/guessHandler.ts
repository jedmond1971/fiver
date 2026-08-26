import { evaluateGuess } from '../../src/game/evaluate.js';
import type { EvaluatedLetter } from '../../src/game/types.js';
import { isValidGuess } from '../../src/game/wordList.js';
import { answerForPuzzleNumber } from './answers.js';

export interface GuessRequestBody {
  puzzleNumber: number;
  guess: string;
  guessNumber: number;
}

export interface GuessResponseBody {
  evaluation: EvaluatedLetter[];
  correct: boolean;
  /** Only present once earned: on a correct guess, or the 6th guess of the puzzle. */
  answer?: string;
}

interface HandlerResult {
  status: number;
  body: GuessResponseBody | { error: string };
}

/**
 * Framework-agnostic core so both the Vercel Function (production) and the
 * Vite dev-server middleware (`npm run dev`) can share one implementation.
 */
export function handleGuess(body: unknown): HandlerResult {
  if (typeof body !== 'object' || body === null) {
    return { status: 400, body: { error: 'Invalid request body' } };
  }

  const { puzzleNumber, guess, guessNumber } = body as Partial<GuessRequestBody>;

  if (typeof puzzleNumber !== 'number' || !Number.isInteger(puzzleNumber) || puzzleNumber < 1) {
    return { status: 400, body: { error: 'Invalid puzzleNumber' } };
  }
  if (typeof guess !== 'string' || !/^[A-Za-z]{5}$/.test(guess)) {
    return { status: 400, body: { error: 'Guess must be a 5-letter word' } };
  }
  if (typeof guessNumber !== 'number' || !Number.isInteger(guessNumber) || guessNumber < 1 || guessNumber > 6) {
    return { status: 400, body: { error: 'Invalid guessNumber' } };
  }

  const word = guess.toUpperCase();
  if (!isValidGuess(word)) {
    return { status: 400, body: { error: 'Not in word list' } };
  }

  const answer = answerForPuzzleNumber(puzzleNumber);
  const evaluation = evaluateGuess(word, answer);
  const correct = word === answer;
  const reveal = correct || guessNumber >= 6;

  return {
    status: 200,
    body: reveal ? { evaluation, correct, answer } : { evaluation, correct },
  };
}
