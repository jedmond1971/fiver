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
import { computeKeyboardStates, evaluateGuess } from './game/evaluate';
import { useFiverGame } from './game/useFiverGame';
import { useIsMobile } from './hooks/useIsMobile';

const STATE_ANNOUNCE: Record<'correct' | 'present' | 'absent', string> = {
  correct: 'correct',
  present: 'present',
  absent: 'absent',
};

export default function App() {
  const { user, needsUsername } = useAuth();
  const game = useFiverGame(user?.id ?? null);
  const isMobile = useIsMobile();
  const [announcement, setAnnouncement] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const prevGuessCount = useRef(0);

  useEffect(() => {
    if (game.guesses.length > prevGuessCount.current) {
      const guess = game.guesses[game.guesses.length - 1];
      const evaluated = evaluateGuess(guess, game.answer);
      const text = evaluated.map((l) => `${l.letter} ${STATE_ANNOUNCE[l.state]}`).join(', ');
      setAnnouncement(`Row ${game.guesses.length}: ${text}`);
    }
    prevGuessCount.current = game.guesses.length;
  }, [game.guesses, game.answer]);

  const keyStates = computeKeyboardStates(game.guesses, game.answer);

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
        onAccount={() => setAccountOpen(true)}
        onLeaderboard={() => setLeaderboardOpen(true)}
      />

      <main className="fiver-board-area">
        <Toast message={game.toast} />
        <Board
          guesses={game.guesses}
          current={game.current}
          answer={game.answer}
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
          guesses={game.guesses}
          answer={game.answer}
          stats={game.stats}
          countdownMs={game.countdownMs}
          shareCopied={game.shareCopied}
          onShare={game.share}
          onClose={() => game.setResultOpen(false)}
        />
      )}

      {game.helpOpen && (
        <HelpModal hardMode={game.hardMode} onToggleHardMode={game.toggleHardMode} onClose={() => game.setHelpOpen(false)} />
      )}

      {needsUsername && <UsernameModal />}

      {accountOpen && !needsUsername && <AccountModal onClose={() => setAccountOpen(false)} />}

      {leaderboardOpen && (
        <LeaderboardModal
          onClose={() => setLeaderboardOpen(false)}
          onRequestSignIn={() => setAccountOpen(true)}
        />
      )}
    </div>
  );
}
