import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { checkHardMode } from './hardMode';
import { getPuzzleInfo, nextLocalMidnight } from './puzzle';
import { fetchStats, recordGameResult } from './remoteStorage';
import { buildShareText } from './share';
import { sound } from './sound';
import {
  loadGame,
  loadHardMode,
  loadSoundEnabled,
  loadStats,
  saveGame,
  saveHardMode,
  saveSoundEnabled,
  saveStats,
} from './storage';
import { applyResultToStats } from './stats';
import type { EvaluatedLetter, GameStatus, Stats } from './types';
import { isValidGuess } from './wordList';

const FLIP_DURATION_MS = 300;
const FLIP_STAGGER_MS = 150;
const ROW_REVEAL_MS = FLIP_STAGGER_MS * 4 + FLIP_DURATION_MS; // last tile start + its own flip
const BOUNCE_STAGGER_MS = 100;
const BOUNCE_DURATION_MS = 300;
const ROW_BOUNCE_MS = BOUNCE_STAGGER_MS * 4 + BOUNCE_DURATION_MS;
const TOAST_MS = 1500;

interface GuessApiResponse {
  evaluation: EvaluatedLetter[];
  correct: boolean;
  answer?: string;
}

async function submitGuessToServer(puzzleNumber: number, guess: string, guessNumber: number): Promise<GuessApiResponse> {
  const res = await fetch('/api/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ puzzleNumber, guess, guessNumber }),
  });
  if (!res.ok) {
    throw new Error(`Guess request failed: ${res.status}`);
  }
  return (await res.json()) as GuessApiResponse;
}

export function useFiverGame(userId: string | null = null) {
  const [now, setNow] = useState(() => new Date());
  const puzzle = useMemo(() => getPuzzleInfo(now), [now]);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluatedLetter[][]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [submitting, setSubmitting] = useState(false);
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [bounceRow, setBounceRow] = useState<number | null>(null);
  const [shakeToken, setShakeToken] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [resultOpen, setResultOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [hardMode, setHardMode] = useState(() => loadHardMode());
  const [shareCopied, setShareCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => loadSoundEnabled());
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const toastTimer = useRef<number | undefined>(undefined);
  const shareTimer = useRef<number | undefined>(undefined);
  const loadedPuzzleNumber = useRef<number | null>(null);

  // Signed-in Stats live in game_results, not the local `fiver:stats` key —
  // reload from the server whenever the signed-in user changes (including
  // sign-out, which falls back to the local guest total).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!userId) {
      setStats(loadStats());
      return;
    }
    let cancelled = false;
    fetchStats(userId)
      .then((remote) => {
        if (!cancelled) setStats(remote);
      })
      .catch(() => {
        // Leave whatever Stats were already showing (e.g. the guest total)
        // rather than clobbering it with an empty total on a transient error.
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Tick every second: drives the countdown and detects local-midnight rollover.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Load (or reset) the day's board whenever the puzzle number changes. This
  // syncs in-progress board state from localStorage keyed on the puzzle id —
  // a legitimate external-system sync, not a render loop — so the blanket
  // set-state-in-effect rule is disabled for this block.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (loadedPuzzleNumber.current === puzzle.puzzleNumber) return;
    loadedPuzzleNumber.current = puzzle.puzzleNumber;

    const stored = loadGame();
    // Older saves (from before server-side scoring) won't have evaluations
    // for their guesses — there's no way to reconstruct those without the
    // answer, so treat that as no saved game rather than showing a board
    // with un-scored rows.
    const usable =
      stored &&
      stored.puzzleNumber === puzzle.puzzleNumber &&
      Array.isArray(stored.evaluations) &&
      stored.evaluations.length === stored.guesses.length;

    if (usable && stored) {
      setGuesses(stored.guesses);
      setEvaluations(stored.evaluations);
      setAnswer(stored.answer);
      setCurrent(stored.current);
      setStatus(stored.status);
      setResultOpen(stored.status !== 'playing');
    } else {
      setGuesses([]);
      setEvaluations([]);
      setAnswer(null);
      setCurrent('');
      setStatus('playing');
      setResultOpen(false);
      saveGame({ puzzleNumber: puzzle.puzzleNumber, guesses: [], evaluations: [], current: '', status: 'playing', answer: null });
    }
    setRevealingRow(null);
    setBounceRow(null);
  }, [puzzle.puzzleNumber]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback(
    (next: { guesses: string[]; evaluations: EvaluatedLetter[][]; current: string; status: GameStatus; answer: string | null }) => {
      saveGame({ puzzleNumber: puzzle.puzzleNumber, ...next });
    },
    [puzzle.puzzleNumber],
  );

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const playSound = useCallback((fn: () => void) => {
    if (soundEnabledRef.current) fn();
  }, []);

  const triggerShake = useCallback(() => {
    // Bumping the token remounts the shaking row (used as its React key),
    // which restarts the CSS shake keyframes even on back-to-back invalid submits.
    setShakeToken((t) => t + 1);
  }, []);

  const finishGame = useCallback(
    (finalGuesses: string[], finalEvaluations: EvaluatedLetter[][], finalAnswer: string, won: boolean) => {
      const finalStatus: GameStatus = won ? 'won' : 'lost';
      setStatus(finalStatus);
      setAnswer(finalAnswer);
      persist({ guesses: finalGuesses, evaluations: finalEvaluations, current: '', status: finalStatus, answer: finalAnswer });
      playSound(won ? sound.win : sound.lose);

      // Computed from the current `stats` closure rather than a setState
      // updater function: React (Strict Mode especially) may invoke an
      // updater twice to check purity, which would double-fire the network
      // call below — a bug the unique (user_id, puzzle_number) constraint
      // happened to mask, but worth avoiding rather than relying on.
      const next = applyResultToStats(stats, won, finalGuesses.length);
      setStats(next);
      if (userId) {
        recordGameResult(userId, puzzle.puzzleNumber, won ? finalGuesses.length : null, won, finalGuesses).catch(() => {
          // Best-effort: the next load re-derives Stats from the server
          // anyway, so a transient failure here doesn't corrupt state.
        });
      } else {
        saveStats(next);
      }

      const openResult = () => setResultOpen(true);
      if (won) {
        setBounceRow(finalGuesses.length - 1);
        window.setTimeout(() => {
          setBounceRow(null);
          openResult();
        }, ROW_BOUNCE_MS);
      } else {
        window.setTimeout(openResult, 300);
      }
    },
    [persist, playSound, puzzle.puzzleNumber, userId, stats],
  );

  const submitGuess = useCallback(() => {
    if (status !== 'playing' || revealingRow !== null || submitting) return;

    if (current.length < 5) {
      showToast('Not enough letters');
      triggerShake();
      playSound(sound.invalid);
      return;
    }

    const word = current.toUpperCase();
    if (!isValidGuess(word)) {
      showToast('Not in word list');
      triggerShake();
      playSound(sound.invalid);
      return;
    }

    if (hardMode) {
      const violation = checkHardMode(word, evaluations);
      if (violation) {
        showToast(violation);
        triggerShake();
        playSound(sound.invalid);
        return;
      }
    }

    const rowIndex = guesses.length;
    setSubmitting(true);

    submitGuessToServer(puzzle.puzzleNumber, word, rowIndex + 1)
      .then((response) => {
        setSubmitting(false);
        setRevealingRow(rowIndex);
        if (soundEnabledRef.current) {
          response.evaluation.forEach((l, i) => sound.tileReveal(l.state, i * FLIP_STAGGER_MS));
        }

        window.setTimeout(() => {
          const nextGuesses = [...guesses, word];
          const nextEvaluations = [...evaluations, response.evaluation];
          setGuesses(nextGuesses);
          setEvaluations(nextEvaluations);
          setCurrent('');
          setRevealingRow(null);

          const lost = !response.correct && nextGuesses.length >= 6;

          if (response.correct || lost) {
            finishGame(nextGuesses, nextEvaluations, response.answer ?? '', response.correct);
          } else {
            persist({ guesses: nextGuesses, evaluations: nextEvaluations, current: '', status: 'playing', answer: null });
          }
        }, ROW_REVEAL_MS);
      })
      .catch(() => {
        setSubmitting(false);
        showToast('Something went wrong — try again');
      });
  }, [
    current,
    evaluations,
    finishGame,
    guesses,
    hardMode,
    persist,
    playSound,
    puzzle.puzzleNumber,
    revealingRow,
    showToast,
    status,
    submitting,
    triggerShake,
  ]);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== 'playing' || revealingRow !== null || helpOpen || resultOpen) return;

      if (key === 'ENTER') {
        submitGuess();
        return;
      }
      if (key === 'BACKSPACE') {
        setCurrent((c) => {
          const next = c.slice(0, -1);
          persist({ guesses, evaluations, current: next, status, answer });
          return next;
        });
        playSound(sound.backspace);
        return;
      }
      if (/^[A-Z]$/.test(key) && current.length < 5) {
        setCurrent((c) => {
          const next = c + key;
          persist({ guesses, evaluations, current: next, status, answer });
          return next;
        });
        playSound(sound.key);
      }
    },
    [answer, current.length, evaluations, guesses, helpOpen, persist, playSound, resultOpen, revealingRow, status, submitGuess],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') {
        handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        handleKey('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  const toggleHardMode = useCallback(() => {
    setHardMode((prev) => {
      const next = !prev;
      saveHardMode(next);
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      saveSoundEnabled(next);
      return next;
    });
  }, []);

  const share = useCallback(() => {
    const text = buildShareText({
      puzzleNumber: puzzle.puzzleNumber,
      evaluations,
      status,
      hardMode,
    });
    navigator.clipboard.writeText(text).then(() => {
      setShareCopied(true);
      window.clearTimeout(shareTimer.current);
      shareTimer.current = window.setTimeout(() => setShareCopied(false), 1500);
    });
  }, [evaluations, hardMode, puzzle.puzzleNumber, status]);

  const countdownMs = Math.max(0, nextLocalMidnight(now).getTime() - now.getTime());

  return {
    answer,
    puzzleNumber: puzzle.puzzleNumber,
    puzzleDate: puzzle.puzzleDate,
    guesses,
    evaluations,
    current,
    status,
    revealingRow,
    bounceRow,
    shakeToken,
    toast,
    stats,
    resultOpen,
    helpOpen,
    hardMode,
    soundEnabled,
    shareCopied,
    countdownMs,
    handleKey,
    setResultOpen,
    setHelpOpen,
    toggleHardMode,
    toggleSound,
    share,
    flipStaggerMs: FLIP_STAGGER_MS,
    bounceStaggerMs: BOUNCE_STAGGER_MS,
  };
}

export type FiverGame = ReturnType<typeof useFiverGame>;
