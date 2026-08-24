import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{2,24}$/;

/**
 * Shown automatically right after a first sign-in, before a `profiles` row
 * exists. Not dismissable via Escape/scrim-click like the other modals — the
 * app can't proceed to a normal signed-in state without a username — but
 * offers Sign out as an explicit way out.
 */
export function UsernameModal() {
  const { completeSignUp, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!USERNAME_PATTERN.test(username)) {
      setError('2-24 characters: letters, numbers, underscores only.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await completeSignUp(username);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="fiver-scrim">
      <div className="fiver-auth-card" role="dialog" aria-modal="true" aria-label="Choose a username">
        <div className="fiver-help-card__title">Choose a username</div>
        <p className="fiver-help-card__text">
          This is how friends will find and recognize you on the leaderboard.
        </p>
        <form onSubmit={handleSubmit} className="fiver-form">
          <label className="fiver-field">
            <span className="fiver-field__label">Username</span>
            <input
              ref={inputRef}
              className="fiver-field__input"
              type="text"
              autoComplete="off"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          {error && <div className="fiver-form-error">{error}</div>}
          <button type="submit" className="fiver-share-button fiver-share-button--full" disabled={submitting}>
            {submitting ? 'Saving…' : 'Continue'}
          </button>
        </form>
        <button type="button" className="fiver-text-button" onClick={() => void signOut()}>
          Cancel and sign out
        </button>
      </div>
    </div>
  );
}
