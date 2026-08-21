import type { StoredGame, Stats } from './types';

const STATS_KEY = 'fiver:stats';
const GAME_KEY = 'fiver:game';
const HARD_MODE_KEY = 'fiver:hardMode';

const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
};

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...EMPTY_STATS };
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return {
      played: parsed.played ?? 0,
      wins: parsed.wins ?? 0,
      currentStreak: parsed.currentStreak ?? 0,
      maxStreak: parsed.maxStreak ?? 0,
      distribution: parsed.distribution ?? [0, 0, 0, 0, 0, 0],
    };
  } catch {
    return { ...EMPTY_STATS };
  }
}

export function saveStats(stats: Stats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadGame(): StoredGame | null {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredGame;
  } catch {
    return null;
  }
}

export function saveGame(game: StoredGame): void {
  localStorage.setItem(GAME_KEY, JSON.stringify(game));
}

export function loadHardMode(): boolean {
  return localStorage.getItem(HARD_MODE_KEY) === 'true';
}

export function saveHardMode(value: boolean): void {
  localStorage.setItem(HARD_MODE_KEY, String(value));
}
