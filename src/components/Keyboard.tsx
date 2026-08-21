import type { KeyState } from '../game/types';

interface KeyboardProps {
  keyStates: Record<string, KeyState>;
  onKey: (key: string) => void;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

const KEY_LABEL: Record<string, string> = { ENTER: '↵', BACKSPACE: '⌫' };

export function Keyboard({ keyStates, onKey }: KeyboardProps) {
  return (
    <div className="fiver-keyboard">
      {ROWS.map((row, i) => (
        <div className="fiver-keyboard__row" key={i}>
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            const state = keyStates[key];
            const classes = ['fiver-key'];
            if (isWide) classes.push('fiver-key--wide');
            classes.push(state ? `fiver-key--${state}` : 'fiver-key--unused');

            return (
              <button
                key={key}
                type="button"
                className={classes.join(' ')}
                onClick={() => onKey(key)}
                aria-label={key === 'ENTER' ? 'Enter' : key === 'BACKSPACE' ? 'Backspace' : key}
              >
                {KEY_LABEL[key] ?? key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
