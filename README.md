# FIVER

A Wordle-style daily five-letter word game. Static client-side React + TypeScript app, no backend.

Implements the "1a Paper" visual direction from `design_handoff_fiver_word_game/README.md`.

## Run it

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run test`.

## Notes

- Word lists are bundled locally in `src/data/` — see the comment in `src/game/wordList.ts` for sources
  and licensing.
- The daily puzzle number is derived client-side from a fixed epoch date in `src/game/puzzle.ts`.
- Game state and stats persist to `localStorage`, keyed by puzzle number.
- Core scoring logic (`evaluateGuess`, duplicate-letter handling) is a pure function with unit tests in
  `src/game/evaluate.test.ts`.
