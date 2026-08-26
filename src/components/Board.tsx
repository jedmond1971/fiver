import type { EvaluatedLetter } from '../game/types';
import type { TileVisualState } from './Tile';
import { Tile } from './Tile';

interface BoardProps {
  guesses: string[];
  evaluations: EvaluatedLetter[][];
  current: string;
  revealingRow: number | null;
  bounceRow: number | null;
  shakeToken: number;
  flipStaggerMs: number;
  bounceStaggerMs: number;
}

const ROWS = 6;
const COLS = 5;

export function Board({
  guesses,
  evaluations,
  current,
  revealingRow,
  bounceRow,
  shakeToken,
  flipStaggerMs,
  bounceStaggerMs,
}: BoardProps) {
  const currentRowIndex = guesses.length;

  return (
    <div className="fiver-board" role="group" aria-label="Guess board">
      {Array.from({ length: ROWS }, (_, rowIndex) => {
        const isSubmitted = rowIndex < guesses.length;
        const isCurrent = rowIndex === currentRowIndex && guesses.length < ROWS;
        const isRevealing = rowIndex === revealingRow;
        const isBouncing = rowIndex === bounceRow;
        const isShaking = isCurrent && shakeToken > 0;

        let letters: string[];
        let evaluated: EvaluatedLetter[] | null = null;

        if (isSubmitted) {
          letters = guesses[rowIndex].split('');
          evaluated = evaluations[rowIndex] ?? null;
        } else if (isCurrent) {
          letters = current.split('');
        } else {
          letters = [];
        }

        return (
          <div
            key={isCurrent ? `current-${shakeToken}` : rowIndex}
            className={`fiver-row${isShaking ? ' fiver-row--shake' : ''}`}
          >
            {Array.from({ length: COLS }, (_, colIndex) => {
              const letter = letters[colIndex] ?? '';
              let state: TileVisualState = 'empty';
              if (evaluated) {
                state = evaluated[colIndex].state;
              } else if (letter) {
                state = 'typed';
              }

              return (
                <Tile
                  key={colIndex}
                  letter={letter}
                  state={state}
                  revealing={isRevealing}
                  revealDelayMs={colIndex * flipStaggerMs}
                  bouncing={isBouncing}
                  bounceDelayMs={colIndex * bounceStaggerMs}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
