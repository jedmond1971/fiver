import { formatPuzzleDate } from '../game/puzzle';
import type { Stats } from '../game/types';
import { AccountIcon } from './icons/AccountIcon';
import { HelpIcon } from './icons/HelpIcon';
import { LeaderboardIcon } from './icons/LeaderboardIcon';
import { StatsIcon } from './icons/StatsIcon';

interface HeaderProps {
  puzzleNumber: number;
  puzzleDate: Date;
  stats: Stats;
  isMobile: boolean;
  isSignedIn: boolean;
  onHelp: () => void;
  onStats: () => void;
  onAccount: () => void;
  onLeaderboard: () => void;
}

export function Header({
  puzzleNumber,
  puzzleDate,
  stats,
  isMobile,
  isSignedIn,
  onHelp,
  onStats,
  onAccount,
  onLeaderboard,
}: HeaderProps) {
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  if (isMobile) {
    return (
      <header className="fiver-header fiver-header--mobile">
        <div className="fiver-header__mobile-group">
          <button type="button" className="fiver-header__glyph-button" onClick={onHelp} aria-label="How to play">
            <HelpIcon />
          </button>
          <button type="button" className="fiver-header__glyph-button" onClick={onLeaderboard} aria-label="Friends leaderboard">
            <LeaderboardIcon />
          </button>
        </div>
        <div className="fiver-wordmark fiver-wordmark--mobile">FIVER</div>
        <div className="fiver-header__mobile-group fiver-header__mobile-group--right">
          <button type="button" className="fiver-header__glyph-button" onClick={onStats} aria-label="Statistics">
            <StatsIcon />
          </button>
          <button
            type="button"
            className={`fiver-header__glyph-button${isSignedIn ? ' fiver-header__glyph-button--active' : ''}`}
            onClick={onAccount}
            aria-label="Account"
          >
            <AccountIcon />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="fiver-header fiver-header--desktop">
      <div className="fiver-header__left">
        <div className="fiver-wordmark">FIVER</div>
        <div className="fiver-header__meta">
          NO. {puzzleNumber} · {formatPuzzleDate(puzzleDate)}
        </div>
      </div>
      <div className="fiver-header__right">
        <div className="fiver-stat">
          <span className="fiver-stat__value">{stats.currentStreak}</span>
          <span className="fiver-stat__label">STREAK</span>
        </div>
        <div className="fiver-header__divider" aria-hidden="true" />
        <div className="fiver-stat fiver-stat--wins">
          <span className="fiver-stat__value">{winPct}%</span>
          <span className="fiver-stat__label">WINS</span>
        </div>
        <div className="fiver-header__icons">
          <button type="button" className="fiver-icon-button" onClick={onHelp} aria-label="How to play">
            <HelpIcon />
          </button>
          <button type="button" className="fiver-icon-button" onClick={onStats} aria-label="Statistics">
            <StatsIcon />
          </button>
          <button type="button" className="fiver-icon-button" onClick={onLeaderboard} aria-label="Friends leaderboard">
            <LeaderboardIcon />
          </button>
          <button
            type="button"
            className={`fiver-icon-button${isSignedIn ? ' fiver-icon-button--active' : ''}`}
            onClick={onAccount}
            aria-label="Account"
          >
            <AccountIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
