import { useEffect, useRef } from 'react';

const THEME_MUSIC_SRC = '/theme-music.mp3';
const THEME_MUSIC_VOLUME = 0.45;

/** Loops the welcome-screen theme music while `active` is true and `enabled` (the sound setting) allows it. */
export function useThemeMusic(active: boolean, enabled: boolean): void {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Some mobile browsers don't reject a blocked play() synchronously — they leave
  // it pending and can resolve it later, off the back of some unrelated later
  // gesture, well after we've already asked to pause. This tracks the current
  // intent so a late-resolving play() can check whether it's still wanted and
  // immediately undo itself if not, instead of leaving stale audio playing.
  const wantsPlaybackRef = useRef(false);

  useEffect(() => {
    wantsPlaybackRef.current = active && enabled;

    if (!active || !enabled) {
      audioRef.current?.pause();
      return;
    }

    // Deferred until actually needed, so visitors who never see the welcome
    // screen (already signed in, sound muted, accounts unavailable) never
    // pay for the download.
    if (!audioRef.current) {
      const audio = new Audio(THEME_MUSIC_SRC);
      audio.loop = true;
      audio.volume = THEME_MUSIC_VOLUME;
      audioRef.current = audio;
    }
    const audio = audioRef.current;

    audio.currentTime = 0;
    const tryPlay = () => {
      audio
        .play()
        .then(() => {
          if (!wantsPlaybackRef.current) audio.pause();
        })
        .catch(() => {});
    };
    tryPlay();

    // Autoplay-with-sound is blocked without a user gesture on most mobile
    // browsers — retry on the visitor's first tap/keypress on the page.
    document.addEventListener('pointerdown', tryPlay, { once: true });
    document.addEventListener('keydown', tryPlay, { once: true });
    return () => {
      document.removeEventListener('pointerdown', tryPlay);
      document.removeEventListener('keydown', tryPlay);
    };
  }, [active, enabled]);
}
