import { evaluateGuess } from './evaluate';
import type { GameStatus } from './types';

const EMOJI: Record<'correct' | 'present' | 'absent', string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬜',
};

export function buildShareText(params: {
  puzzleNumber: number;
  guesses: string[];
  answer: string;
  status: GameStatus;
  hardMode: boolean;
}): string {
  const { puzzleNumber, guesses, answer, status, hardMode } = params;
  const grid = guesses
    .map((guess) =>
      evaluateGuess(guess, answer)
        .map(({ state }) => EMOJI[state])
        .join(''),
    )
    .join('\n');
  const score = status === 'won' ? `${guesses.length}/6` : 'X/6';
  const hardModeMark = hardMode ? '*' : '';

  return `FIVER ${puzzleNumber} ${score}${hardModeMark}\n\n${grid}`;
}
