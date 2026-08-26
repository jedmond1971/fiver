import type { EvaluatedLetter, GameStatus } from './types';

const EMOJI: Record<'correct' | 'present' | 'absent', string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬜',
};

export function buildShareText(params: {
  puzzleNumber: number;
  evaluations: EvaluatedLetter[][];
  status: GameStatus;
  hardMode: boolean;
}): string {
  const { puzzleNumber, evaluations, status, hardMode } = params;
  const grid = evaluations
    .map((evaluation) => evaluation.map(({ state }) => EMOJI[state]).join(''))
    .join('\n');
  const score = status === 'won' ? `${evaluations.length}/6` : 'X/6';
  const hardModeMark = hardMode ? '*' : '';

  return `FIVER ${puzzleNumber} ${score}${hardModeMark}\n\n${grid}`;
}
