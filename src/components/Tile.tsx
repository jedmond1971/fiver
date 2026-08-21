import type { LetterState } from '../game/types';

export type TileVisualState = LetterState | 'typed' | 'empty';

interface TileProps {
  letter: string;
  state: TileVisualState;
  /** ms delay before this tile's flip animation starts (staggered reveal). */
  revealDelayMs?: number;
  revealing?: boolean;
  bouncing?: boolean;
  bounceDelayMs?: number;
}

const STATE_LABEL: Record<LetterState, string> = {
  correct: 'correct',
  present: 'present in a different spot',
  absent: 'not in the word',
};

function ariaLabel(letter: string, state: TileVisualState): string {
  if (state === 'empty') return 'empty';
  if (state === 'typed') return `${letter}`;
  return `${letter}, ${STATE_LABEL[state]}`;
}

export function Tile({ letter, state, revealDelayMs, revealing, bouncing, bounceDelayMs }: TileProps) {
  const classes = ['fiver-tile', `fiver-tile--${state}`];
  if (revealing) classes.push('fiver-tile--revealing');
  if (bouncing) classes.push('fiver-tile--bouncing');

  const style: React.CSSProperties = {};
  if (revealing && revealDelayMs !== undefined) style.animationDelay = `${revealDelayMs}ms`;
  if (bouncing && bounceDelayMs !== undefined) style.animationDelay = `${bounceDelayMs}ms`;

  return (
    <div className={classes.join(' ')} style={style} aria-label={ariaLabel(letter, state)}>
      <span aria-hidden="true">{letter}</span>
    </div>
  );
}
