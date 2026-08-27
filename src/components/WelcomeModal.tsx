import { useEffect, useRef } from 'react';

interface WelcomeModalProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onPlayAsGuest: () => void;
}

export function WelcomeModal({ onSignIn, onSignUp, onPlayAsGuest }: WelcomeModalProps) {
  const guestButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    guestButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onPlayAsGuest();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPlayAsGuest]);

  return (
    <div className="fiver-scrim" onClick={onPlayAsGuest}>
      <div
        className="fiver-help-card fiver-welcome-card"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to FIVER"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fiver-wordmark fiver-welcome-card__wordmark">FIVER</div>
        <p className="fiver-help-card__text">
          Guess the daily five-letter word in six tries. Sign in to save your streak across
          devices, or jump straight into today's puzzle as a guest.
        </p>

        <div className="fiver-welcome-card__actions">
          <button type="button" className="fiver-share-button fiver-share-button--full" onClick={onSignIn}>
            Sign in
          </button>
          <button type="button" className="fiver-share-button fiver-share-button--full fiver-share-button--muted" onClick={onSignUp}>
            Create account
          </button>
          <button
            type="button"
            className="fiver-text-button fiver-welcome-card__guest"
            onClick={onPlayAsGuest}
            ref={guestButtonRef}
          >
            Play as guest
          </button>
        </div>
      </div>
    </div>
  );
}
