import type { LetterState } from './types';

/**
 * Small Web Audio tone engine — no audio assets to source/license, just
 * short synthesized beeps. The AudioContext is created lazily on first use
 * since browsers block audio until a user gesture (the first keypress
 * satisfies that).
 */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    ctx = new AudioCtor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, durationMs: number, type: OscillatorType = 'sine', peakVolume = 0.15, delayMs = 0) {
  const audio = getContext();
  if (!audio) return;

  const startAt = audio.currentTime + delayMs / 1000;
  const duration = durationMs / 1000;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);

  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peakVolume, startAt + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain).connect(audio.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

const REVEAL_TONE: Record<LetterState, { freq: number; type: OscillatorType; volume: number }> = {
  correct: { freq: 880, type: 'triangle', volume: 0.16 },
  present: { freq: 660, type: 'triangle', volume: 0.14 },
  absent: { freq: 260, type: 'sine', volume: 0.08 },
};

export const sound = {
  key(): void {
    tone(520, 30, 'square', 0.05);
  },
  backspace(): void {
    tone(320, 30, 'square', 0.05);
  },
  invalid(): void {
    tone(160, 90, 'sawtooth', 0.12);
    tone(140, 120, 'sawtooth', 0.1, 90);
  },
  tileReveal(state: LetterState, delayMs = 0): void {
    const { freq, type, volume } = REVEAL_TONE[state];
    tone(freq, 90, type, volume, delayMs);
  },
  win(): void {
    [523, 659, 784, 1047].forEach((freq, i) => tone(freq, 160, 'triangle', 0.15, i * 110));
  },
  lose(): void {
    [392, 330, 262].forEach((freq, i) => tone(freq, 220, 'sine', 0.13, i * 140));
  },
};
