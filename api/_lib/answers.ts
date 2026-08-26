// Server-only: the answer list must never be imported from src/ client code,
// or Vite would bundle it into the JS shipped to the browser.
import answersData from '../../src/data/answers.json' with { type: 'json' };

const ANSWERS: readonly string[] = answersData as string[];

export function answerForPuzzleNumber(puzzleNumber: number): string {
  const index = (((puzzleNumber - 1) % ANSWERS.length) + ANSWERS.length) % ANSWERS.length;
  return ANSWERS[index].toUpperCase();
}
