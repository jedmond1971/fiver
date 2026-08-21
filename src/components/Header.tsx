import { formatPuzzleDate } from '../game/puzzle';
import type { Stats } from '../game/types';
import { HelpIcon } from './icons/HelpIcon';
import { StatsIcon } from './icons/StatsIcon';

interface HeaderProps {
  puzzleNumber: number;
  puzzleDate: Date;
  stats: Stats;
  isMobile: boolean;
  onHelp: () => void;
  onStats: () => void;
}

export function Header({ puzzleNumber, puzzleDate, stats, isMobile, onHelp, onStats }: HeaderProps) {
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  if (isMobile) {
    return (
      <header className="fiver-header fiver-header--mobile">
        <button type="button" className="fiver-header__glyph-button" onClick={onHelp} aria-label="How to play">
          <HelpIcon />
        </button>
        <div className="fiver-wordmark fiver-wordmark--mobile">FIVER</div>
        <button
          type="button"
          className="fiver-header__glyph-button fiver-header__glyph-button--right"
          onClick={onStats}
          aria-label="Statistics"
        >
          <StatsIcon />
        </button>
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
        </div>
      </div>
    </header>
  );
}
