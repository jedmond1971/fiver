import { useCallback, useEffect, useRef, useState } from 'react';
import { WelcomeTiles } from './WelcomeTiles';

interface WelcomeModalProps {
  /** Signed-in username, if the visitor already has a valid session. */
  username: string | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onContinue: () => void;
}

// Dismissing is also the visitor's first on-page gesture, which is what unlocks
// audio autoplay on most mobile browsers — without this beat, the theme music
// would only ever get unlocked right as it's about to be paused.
const DISMISS_DELAY_MS = 700;

export function WelcomeModal({ username, onSignIn, onSignUp, onContinue }: WelcomeModalProps) {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    primaryButtonRef.current?.focus();
  }, []);

  const handleContinue = useCallback(() => {
    setDismissing((already) => {
      if (!already) window.setTimeout(onContinue, DISMISS_DELAY_MS);
      return true;
    });
  }, [onContinue]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleContinue();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleContinue]);

  return (
    <div className="fiver-scrim" onClick={handleContinue}>
      <WelcomeTiles />
      <div
        className="fiver-help-card fiver-welcome-card"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to FIVER"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fiver-wordmark fiver-welcome-card__wordmark">FIVER</div>

        {username ? (
          <>
            <p className="fiver-help-card__text">Welcome back, {username}.</p>
            <div className="fiver-welcome-card__actions">
              <button
                type="button"
                className="fiver-share-button fiver-share-button--full"
                onClick={handleContinue}
                disabled={dismissing}
                ref={primaryButtonRef}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="fiver-help-card__text">
              Guess the daily five-letter word in six tries. Sign in to save your streak across
              devices, or jump straight into today's puzzle as a guest.
            </p>
            <div className="fiver-welcome-card__actions">
              <button type="button" className="fiver-share-button fiver-share-button--full" onClick={onSignIn}>
                Sign in
              </button>
              <button
                type="button"
                className="fiver-share-button fiver-share-button--full fiver-share-button--muted"
                onClick={onSignUp}
              >
                Create account
              </button>
              <button
                type="button"
                className="fiver-text-button fiver-welcome-card__guest"
                onClick={handleContinue}
                disabled={dismissing}
                ref={primaryButtonRef}
              >
                Play as guest
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
