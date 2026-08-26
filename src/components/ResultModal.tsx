import { useEffect, useRef } from 'react';
import { formatCountdown } from '../game/formatCountdown';
import type { EvaluatedLetter, GameStatus, Stats } from '../game/types';
import { CloseIcon } from './icons/CloseIcon';

const WIN_HEADLINES = ['Flawless', 'Remarkable', 'Splendid', 'Well played', 'Nicely done', 'Just made it'];
const LOSS_HEADLINE = 'So it goes';

interface ResultModalProps {
  status: GameStatus;
  evaluations: EvaluatedLetter[][];
  answer: string | null;
  stats: Stats;
  countdownMs: number;
  shareCopied: boolean;
  onShare: () => void;
  onClose: () => void;
}

export function ResultModal({
  status,
  evaluations,
  answer,
  stats,
  countdownMs,
  shareCopied,
  onShare,
  onClose,
}: ResultModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const finished = status === 'won' || status === 'lost';
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <div className="fiver-scrim" onClick={onClose}>
      <div
        className="fiver-result-card"
        role="dialog"
        aria-modal="true"
        aria-label={finished ? 'Puzzle result' : 'Statistics'}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="fiver-result-card__close" onClick={onClose} aria-label="Close" ref={closeButtonRef}>
          <CloseIcon />
        </button>

        {finished ? (
          <>
            {status === 'won' && (
              <div className="fiver-result-card__eyebrow">SOLVED IN {evaluations.length}</div>
            )}
            <div className="fiver-result-card__headline">
              {status === 'won' ? WIN_HEADLINES[Math.min(evaluations.length, 6) - 1] : LOSS_HEADLINE}
            </div>
            {answer && (
              <div className="fiver-result-card__subline">
                {status === 'won' ? "Today's word was " : 'The word was '}
                <span className={`fiver-result-card__word${status === 'lost' ? ' fiver-result-card__word--lost' : ''}`}>
                  {answer}
                </span>
              </div>
            )}
            <div className="fiver-result-card__grid" aria-hidden="true">
              {evaluations.map((evaluation, i) => (
                <div className="fiver-result-card__grid-row" key={i}>
                  {evaluation.map((letter, j) => (
                    <div key={j} className={`fiver-result-card__block fiver-result-card__block--${letter.state}`} />
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="fiver-result-card__headline fiver-result-card__headline--stats">Statistics</div>
        )}

        <div className="fiver-result-card__stats">
          <div className="fiver-result-card__stat">
            <div className="fiver-result-card__stat-value">{stats.played}</div>
            <div className="fiver-result-card__stat-label">PLAYED</div>
          </div>
          <div className="fiver-result-card__stat">
            <div className="fiver-result-card__stat-value">{winPct}</div>
            <div className="fiver-result-card__stat-label">WIN %</div>
          </div>
          <div className="fiver-result-card__stat">
            <div className="fiver-result-card__stat-value">{stats.currentStreak}</div>
            <div className="fiver-result-card__stat-label">STREAK</div>
          </div>
          <div className="fiver-result-card__stat">
            <div className="fiver-result-card__stat-value">{stats.maxStreak}</div>
            <div className="fiver-result-card__stat-label">BEST</div>
          </div>
        </div>

        <div className="fiver-result-card__footer">
          <div className="fiver-result-card__countdown">
            Next word in <span>{formatCountdown(countdownMs)}</span>
          </div>
          {finished && (
            <button type="button" className="fiver-share-button" onClick={onShare}>
              {shareCopied ? 'Copied' : 'Share'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
