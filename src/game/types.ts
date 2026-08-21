export type LetterState = 'correct' | 'present' | 'absent';

export interface EvaluatedLetter {
  letter: string;
  state: LetterState;
}

export type KeyState = LetterState | 'unused';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = number of wins solved in i + 1 guesses */
  distribution: number[];
}

export interface StoredGame {
  puzzleNumber: number;
  guesses: string[];
  current: string;
  status: GameStatus;
}

export interface PuzzleInfo {
  puzzleNumber: number;
  puzzleDate: Date;
  answer: string;
}
