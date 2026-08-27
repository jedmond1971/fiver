import { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth/useAuth';
import { AccountModal } from './components/AccountModal';
import { Board } from './components/Board';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { Keyboard } from './components/Keyboard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ResultModal } from './components/ResultModal';
import { Toast } from './components/Toast';
import { UsernameModal } from './components/UsernameModal';
import { WelcomeModal } from './components/WelcomeModal';
import { computeKeyboardStates } from './game/evaluate';
import { useFiverGame } from './game/useFiverGame';
import { useIsMobile } from './hooks/useIsMobile';
import { useThemeMusic } from './hooks/useThemeMusic';

const STATE_ANNOUNCE: Record<'correct' | 'present' | 'absent', string> = {
  correct: 'correct',
  present: 'present',
  absent: 'absent',
};

export default function App() {
  const { user, profile, needsUsername, ready, authAvailable } = useAuth();
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  // Stays true across the welcome screen and any sign-in/sign-up attempt launched
  // from it, so the theme music and board-input block only lift once that flow is
  // actually resolved (authenticated, or explicitly abandoned) — not the instant
  // the welcome card itself is replaced by the account form.
  const [introActive, setIntroActive] = useState(true);
  const [accountModalMode, setAccountModalMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [accountOpen, setAccountOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const prevGuessCount = useRef(0);

  // When signed in, hold off until the profile (for the greeting name) has loaded
  // rather than flashing the signed-out variant first.
  const showWelcome = welcomeOpen && ready && authAvailable && !needsUsername && (user === null || profile !== null);
  const boardBlocked = showWelcome || (introActive && accountOpen);
  const game = useFiverGame(user?.id ?? null, boardBlocked);
  const isMobile = useIsMobile();
  useThemeMusic(introActive && ready && authAvailable, game.soundEnabled);

  const endIntro = () => setIntroActive(false);

  useEffect(() => {
    if (game.guesses.length > prevGuessCount.current) {
      const evaluated = game.evaluations[game.evaluations.length - 1];
      const text = evaluated.map((l) => `${l.letter} ${STATE_ANNOUNCE[l.state]}`).join(', ');
      setAnnouncement(`Row ${game.guesses.length}: ${text}`);
    }
    prevGuessCount.current = game.guesses.length;
  }, [game.guesses, game.evaluations]);

  const keyStates = computeKeyboardStates(game.evaluations);

  return (
    <div className="fiver-app">
      <Header
        puzzleNumber={game.puzzleNumber}
        puzzleDate={game.puzzleDate}
        stats={game.stats}
        isMobile={isMobile}
        isSignedIn={user !== null}
        onHelp={() => game.setHelpOpen(true)}
        onStats={() => game.setResultOpen(true)}
        onAccount={() => {
          setAccountModalMode('sign-in');
          setAccountOpen(true);
        }}
        onLeaderboard={() => setLeaderboardOpen(true)}
      />

      <main className="fiver-board-area">
        <Toast message={game.toast} />
        <Board
          guesses={game.guesses}
          evaluations={game.evaluations}
          current={game.current}
          revealingRow={game.revealingRow}
          bounceRow={game.bounceRow}
          shakeToken={game.shakeToken}
          flipStaggerMs={game.flipStaggerMs}
          bounceStaggerMs={game.bounceStaggerMs}
        />
      </main>

      <div className="fiver-sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {isMobile && <Keyboard keyStates={keyStates} onKey={game.handleKey} />}

      {game.resultOpen && (
        <ResultModal
          status={game.status}
          evaluations={game.evaluations}
          answer={game.answer}
          stats={game.stats}
          countdownMs={game.countdownMs}
          shareCopied={game.shareCopied}
          onShare={game.share}
          onClose={() => game.setResultOpen(false)}
        />
      )}

      {game.helpOpen && (
        <HelpModal
          hardMode={game.hardMode}
          onToggleHardMode={game.toggleHardMode}
          soundEnabled={game.soundEnabled}
          onToggleSound={game.toggleSound}
          onClose={() => game.setHelpOpen(false)}
        />
      )}

      {needsUsername && <UsernameModal />}

      {accountOpen && !needsUsername && (
        <AccountModal
          initialMode={accountModalMode}
          onClose={() => {
            setAccountOpen(false);
            endIntro();
          }}
          onAuthenticated={endIntro}
        />
      )}

      {showWelcome && (
        <WelcomeModal
          username={profile ? profile.username : null}
          onSignIn={() => {
            setAccountModalMode('sign-in');
            setAccountOpen(true);
            setWelcomeOpen(false);
          }}
          onSignUp={() => {
            setAccountModalMode('sign-up');
            setAccountOpen(true);
            setWelcomeOpen(false);
          }}
          onContinue={() => {
            setWelcomeOpen(false);
            endIntro();
          }}
        />
      )}

      {leaderboardOpen && (
        <LeaderboardModal
          onClose={() => setLeaderboardOpen(false)}
          onRequestSignIn={() => setAccountOpen(true)}
        />
      )}
    </div>
  );
}
