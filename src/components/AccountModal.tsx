import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { CloseIcon } from './icons/CloseIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface AccountModalProps {
  onClose: () => void;
  initialMode?: Mode;
}

type Mode = 'sign-in' | 'sign-up';

export function AccountModal({ onClose, initialMode = 'sign-in' }: AccountModalProps) {
  const { user, profile, authAvailable, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut } = useAuth();
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
        className="fiver-auth-card"
        role="dialog"
        aria-modal="true"
        aria-label="Account"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="fiver-auth-card__close" onClick={onClose} aria-label="Close" ref={closeButtonRef}>
          <CloseIcon />
        </button>

        {!authAvailable ? (
          <>
            <div className="fiver-help-card__title">Accounts unavailable</div>
            <p className="fiver-help-card__text">
              This deployment isn't connected to Supabase yet, so sign-in isn't available. You can still play as a
              guest — your stats stay on this device.
            </p>
          </>
        ) : user && profile ? (
          <SignedInView username={profile.username} legacyPlayed={profile.legacyStats?.played ?? 0} onSignOut={signOut} onClose={onClose} />
        ) : (
          <AuthForm
            initialMode={initialMode}
            onSignInWithPassword={signInWithPassword}
            onSignUpWithPassword={signUpWithPassword}
            onSignInWithGoogle={signInWithGoogle}
          />
        )}
      </div>
    </div>
  );
}

function SignedInView({
  username,
  legacyPlayed,
  onSignOut,
  onClose,
}: {
  username: string;
  legacyPlayed: number;
  onSignOut: () => Promise<void>;
  onClose: () => void;
}) {
  const [signingOut, setSigningOut] = useState(false);

  return (
    <>
      <div className="fiver-help-card__title">Account</div>
      <div className="fiver-account-row">
        <div className="fiver-account-row__avatar" aria-hidden="true">
          {username.slice(0, 1).toUpperCase()}
        </div>
        <div className="fiver-account-row__name">{username}</div>
      </div>
      {legacyPlayed > 0 && (
        <p className="fiver-help-card__text">
          {legacyPlayed} game{legacyPlayed === 1 ? '' : 's'} played before you signed in — carried over as history,
          not counted toward your streak.
        </p>
      )}
      <button
        type="button"
        className="fiver-share-button fiver-share-button--muted"
        disabled={signingOut}
        onClick={async () => {
          setSigningOut(true);
          await onSignOut();
          onClose();
        }}
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </>
  );
}

function AuthForm({
  initialMode,
  onSignInWithPassword,
  onSignUpWithPassword,
  onSignInWithGoogle,
}: {
  initialMode: Mode;
  onSignInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUpWithPassword: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  onSignInWithGoogle: () => Promise<{ error: string | null }>;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    const result = mode === 'sign-in' ? await onSignInWithPassword(email, password) : await onSignUpWithPassword(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if ('needsEmailConfirmation' in result && result.needsEmailConfirmation) {
      setInfo('Check your email to confirm your account, then sign in.');
    }
  };

  return (
    <>
      <div className="fiver-help-card__title">{mode === 'sign-in' ? 'Sign in' : 'Create account'}</div>

      <div className="fiver-tab-group" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sign-in'}
          className={`fiver-tab${mode === 'sign-in' ? ' fiver-tab--active' : ''}`}
          onClick={() => {
            setMode('sign-in');
            setError(null);
            setInfo(null);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sign-up'}
          className={`fiver-tab${mode === 'sign-up' ? ' fiver-tab--active' : ''}`}
          onClick={() => {
            setMode('sign-up');
            setError(null);
            setInfo(null);
          }}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="fiver-form">
        <label className="fiver-field">
          <span className="fiver-field__label">Email</span>
          <input
            id="fiver-auth-email"
            name="email"
            className="fiver-field__input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="fiver-field">
          <span className="fiver-field__label">Password</span>
          <input
            id="fiver-auth-password"
            name="password"
            className="fiver-field__input"
            type="password"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="fiver-form-error">{error}</div>}
        {info && <div className="fiver-form-info">{info}</div>}

        <button type="submit" className="fiver-share-button fiver-share-button--full" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div className="fiver-help-card__divider" />

      <button
        type="button"
        className="fiver-oauth-button"
        onClick={async () => {
          setError(null);
          const result = await onSignInWithGoogle();
          if (result.error) setError(result.error);
        }}
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </>
  );
}
