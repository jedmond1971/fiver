import { useEffect, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface HelpModalProps {
  hardMode: boolean;
  onToggleHardMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClose: () => void;
}

export function HelpModal({ hardMode, onToggleHardMode, soundEnabled, onToggleSound, onClose }: HelpModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fiver-scrim" onClick={onClose}>
      <div
        className="fiver-help-card"
        role="dialog"
        aria-modal="true"
        aria-label="How to play"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="fiver-help-card__close" onClick={onClose} aria-label="Close" ref={closeButtonRef}>
          <CloseIcon />
        </button>

        <div className="fiver-help-card__title">How to play</div>
        <p className="fiver-help-card__text">
          Guess the FIVER word in six tries. Each guess must be a real five-letter word. After each
          guess, the tiles change color to show how close you were.
        </p>

        <ul className="fiver-help-card__legend">
          <li>
            <span className="fiver-help-card__swatch fiver-help-card__swatch--correct" />
            Correct — right letter, right spot
          </li>
          <li>
            <span className="fiver-help-card__swatch fiver-help-card__swatch--present" />
            Present — right letter, wrong spot
          </li>
          <li>
            <span className="fiver-help-card__swatch fiver-help-card__swatch--absent" />
            Absent — letter isn't in the word
          </li>
        </ul>

        <p className="fiver-help-card__text">A new word arrives at midnight, every day.</p>

        <div className="fiver-help-card__divider" />

        <div className="fiver-help-card__setting">
          <div>
            <div className="fiver-help-card__setting-title">Hard Mode</div>
            <div className="fiver-help-card__setting-desc">Any revealed hints must be used in later guesses.</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hardMode}
            className={`fiver-switch${hardMode ? ' fiver-switch--on' : ''}`}
            onClick={onToggleHardMode}
          >
            <span className="fiver-switch__thumb" />
          </button>
        </div>

        <div className="fiver-help-card__setting">
          <div>
            <div className="fiver-help-card__setting-title">Sound</div>
            <div className="fiver-help-card__setting-desc">Play sounds for key presses, guesses, and results.</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            className={`fiver-switch${soundEnabled ? ' fiver-switch--on' : ''}`}
            onClick={onToggleSound}
          >
            <span className="fiver-switch__thumb" />
          </button>
        </div>
      </div>
    </div>
  );
}
