import { useEffect, useRef } from 'react';

interface WelcomeModalProps {
  /** Signed-in username, if the visitor already has a valid session. */
  username: string | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onContinue: () => void;
}

export function WelcomeModal({ username, onSignIn, onSignUp, onContinue }: WelcomeModalProps) {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onContinue();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onContinue]);

  return (
    <div className="fiver-scrim" onClick={onContinue}>
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
                onClick={onContinue}
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
                onClick={onContinue}
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
