interface TileConfig {
  letter: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  variant: 'correct' | 'present' | 'absent';
  reverse?: boolean;
}

// Hand-tuned rather than randomized so the layout is stable and never clumps —
// varied size/speed/delay is enough to read as organic without true randomness.
const TILES: TileConfig[] = [
  { letter: 'F', left: '3%', size: 40, duration: 19, delay: 0, variant: 'correct' },
  { letter: 'I', left: '13%', size: 32, duration: 16, delay: 3, variant: 'present', reverse: true },
  { letter: 'V', left: '23%', size: 44, duration: 22, delay: 7, variant: 'absent' },
  { letter: 'E', left: '33%', size: 36, duration: 17, delay: 1.5, variant: 'correct', reverse: true },
  { letter: 'R', left: '43%', size: 42, duration: 20, delay: 5, variant: 'present' },
  { letter: 'S', left: '53%', size: 34, duration: 18, delay: 9, variant: 'absent', reverse: true },
  { letter: 'T', left: '61%', size: 40, duration: 15, delay: 2, variant: 'correct' },
  { letter: 'O', left: '69%', size: 32, duration: 23, delay: 6, variant: 'present', reverse: true },
  { letter: 'N', left: '77%', size: 44, duration: 19, delay: 10, variant: 'absent' },
  { letter: 'A', left: '87%', size: 36, duration: 16, delay: 4, variant: 'correct', reverse: true },
  { letter: 'L', left: '8%', size: 30, duration: 25, delay: 12, variant: 'present' },
  { letter: 'D', left: '57%', size: 28, duration: 24, delay: 14, variant: 'absent', reverse: true },
  { letter: 'C', left: '37%', size: 30, duration: 26, delay: 8, variant: 'correct' },
  { letter: 'U', left: '93%', size: 34, duration: 18, delay: 16, variant: 'present', reverse: true },
  { letter: 'M', left: '19%', size: 28, duration: 27, delay: 11, variant: 'absent' },
  { letter: 'P', left: '67%', size: 32, duration: 21, delay: 13, variant: 'correct', reverse: true },
];

/** Ambient Wordle-tile animation drifting up behind the welcome card. Purely decorative. */
export function WelcomeTiles() {
  return (
    <div className="fiver-welcome-tiles" aria-hidden="true">
      {TILES.map((tile, i) => (
        <span
          key={i}
          className={`fiver-welcome-tile fiver-welcome-tile--${tile.variant}${tile.reverse ? ' fiver-welcome-tile--reverse' : ''}`}
          style={{
            left: tile.left,
            width: tile.size,
            height: tile.size,
            fontSize: tile.size * 0.42,
            animationDuration: `${tile.duration}s`,
            animationDelay: `${tile.delay}s`,
          }}
        >
          {tile.letter}
        </span>
      ))}
    </div>
  );
}
