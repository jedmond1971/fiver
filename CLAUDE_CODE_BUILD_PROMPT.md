# Build prompt for Claude Code — FIVER (1a Paper)

Copy everything below into Claude Code, run from the `fiver` project root (`/home/jamie/Projects/fiver`).

---

## Goal

Build **FIVER**, a Wordle-style daily five-letter word game, as a real working web app. A complete visual/interaction spec already exists as a design handoff in this repo at:

```
design_handoff_fiver_word_game/
├── README.md                          ← authoritative spec, read this first, in full
├── FIVER Word Game.dc.html            ← design reference markup (see note below)
├── ios-frame.jsx                      ← mockup chrome only — DO NOT port
├── browser-window.jsx                 ← mockup chrome only — DO NOT port
└── screenshots/
    ├── 1a-paper.png                   ← desktop (win overlay) + mobile (in-progress), side by side
    └── 1a-paper-board-no-overlay.png  ← same desktop board with overlay hidden
```

Read `design_handoff_fiver_word_game/README.md` in full before writing any code — it is long and detailed on purpose, and the values in it (colors, sizes, spacing, copy) are final, not placeholders. Look at both screenshots to confirm what the README describes. `FIVER Word Game.dc.html` is a design-tool export using a custom streaming-template runtime — do not try to run or reuse it as-is; read it only for markup structure and inline style values on the **1a Paper desktop and mobile sections**. Ignore every other direction inside that file (1b Editorial, 1c Night) — they're out of scope for this build. `ios-frame.jsx` and `browser-window.jsx` are presentation chrome used to stage the screenshots (a fake iPhone bezel and a fake browser window) — they are not part of the product and must not be ported into the app.

## Scope for this build

**Build only the 1a "Paper" direction** — desktop and mobile, both required. Do not build 1b Editorial or 1c Night, and do not build a theme switcher between directions; that's explicitly out of scope for now. Do not add dark mode. If you want to leave a clean seam for adding themes later (e.g. CSS custom properties for all color tokens rather than hardcoded hex), that's good practice, but don't build the other themes' UI.

## Tech stack

Scaffold a new **React + TypeScript + Vite** app in this project root. Use plain CSS (CSS Modules or a single well-organized stylesheet with custom properties for the design tokens) rather than a UI framework or Tailwind — the design has exact pixel values, exact colors, and exact spacing throughout, and hand-written CSS will hit those precisely with less fighting a framework's defaults. Load `Instrument Sans` and `Instrument Serif` from Google Fonts (these are the only two typefaces 1a uses — `DM Mono` is only used by the out-of-scope Night direction, skip it).

Set up normal tooling: TypeScript strict mode, ESLint, a `package.json` with `dev`/`build`/`preview` scripts. No backend/server is needed — this is a static client-side app.

## Word list

Source a well-known open five-letter word list for this (e.g. the widely-used public Wordle answer list of ~2,300 curated common words, and the larger ~13,000-word valid-guess list used to accept/reject submissions). Bundle both as local JSON or text files in the repo (e.g. `src/data/answers.json`, `src/data/valid-guesses.json`) — don't fetch them from a network at runtime. Pick actively-maintained, freely-licensed sources and note where they came from in a code comment.

Daily word selection: derive a stable `puzzleNumber` from a fixed epoch date (pick a reasonable launch date, e.g. the date you're building this) counting days since then, and index into the answers list deterministically by that number (e.g. `puzzleNumber % answers.length`) so the same word shows for everyone on a given calendar day and advances at local midnight. Puzzle date/number both need to be derivable purely client-side from the current date — no server call.

## Build this exactly per the README

Everything below is called out in the README in more detail — treat this list as a checklist, not a replacement for reading it:

- **Desktop layout** — header bar (wordmark, puzzle number/date, streak, win %, help + stats icon buttons), centered 6×5 board, win overlay with result card (headline, solved word, mini result grid, 4-stat row, countdown + Share button). Exact sizes, colors, spacing, and type are all in README section 1.
- **Mobile layout** — compact centered header, centered board (smaller tiles), on-screen keyboard pinned to the bottom with safe-area padding. Exact sizes in README section 2. The on-screen keyboard must be **mobile-only** — never rendered on desktop, where physical keyboard input drives the game.
- **Game logic** — six guesses at a five-letter word, tile coloring after each submit (correct / present / absent), with **correct duplicate-letter handling**: mark exact matches first, then consume remaining letter counts for present/absent — implement this as a pure function, not inline in a component, so it's easy to unit test.
- **State shape** — use the fields listed under "State Management" in the README (`answer`, `puzzleNumber`, `puzzleDate`, `guesses`, `current`, `status`, `revealing`, `toast`, `stats`, `resultOpen`, `hardMode`) and the transition flow described there.
- **Persistence** — store the day's board/status/stats in `localStorage` keyed by puzzle number, so a reload mid-game restores state; a new day's puzzle number resets the board but keeps cumulative stats (played/wins/streak/maxStreak/distribution).
- **Interactions** (all detailed under "Interactions & Behavior" in the README — implement every one):
  - Letter entry (physical keyboard on desktop, on-screen on mobile), Backspace, Enter-to-submit only at 5 letters.
  - Invalid submit (too short / not a real word) → horizontal shake + toast, exact timing given in the README.
  - Valid submit → staggered per-tile flip revealing color, keyboard keys recolor after the row finishes.
  - Win → short tile bounce, then the result card fades/rises in.
  - Loss (6 wrong guesses) → same result card, headline replaced by the revealed answer, no "solved in" line — write natural copy in the same voice as the win headline ("Splendid").
  - Share → copies an emoji-block result grid + `FIVER 842 3/6`-style line to the clipboard, button shows a brief "Copied" confirmation.
  - Live countdown to next local midnight, `tabular-nums` for all countdown/number digits.
  - Hover states on pointer devices only (not on touch).
  - Responsive board scaling (tile size shrinks by breakpoint, not a layout rewrite) exactly as described.
- **Accessibility** — this is a hard requirement, not a nice-to-have: every tile needs an `aria-label` describing letter + state (e.g. "P, correct"), row results announced via a live region, visible focus outlines on all interactive elements, and every key/icon button at least 44px of hit area (per README sizes, this is already satisfied if you don't shrink anything below spec).
- **Help modal** — the `?` icon opens a how-to-play modal. This isn't visually mocked, so design it yourself in the same visual language as the rest of 1a (warm paper background, `Instrument Sans`/`Instrument Serif`, same border/radius/spacing tokens) — explain the rules and show a small colored-tile legend (correct/present/absent).
- **Stats icon** — reopens the same result card component used for win/loss (confirmed by the README's state notes: `resultOpen` is "re-openable from the stats icon") — you do not need a separate stats screen.
- **Hard mode** — implement the toggle and standard hard-mode enforcement (any revealed correct/present letter from a previous guess must be reused in the correct position/included in subsequent guesses); surface the toggle in the help/settings area since there's no dedicated settings mock — keep it simple and consistent with the rest of the UI.

Use the exact color, type, spacing, and radius tables in the README's "Design Tokens" section as CSS custom properties rather than copying hex/px values inline throughout components — this will also make it easy to verify nothing drifted from spec.

No brand assets are involved and none should be added — this is an original design, deliberately distinct from NYT Wordle's branding. The `?` and `▤` glyphs in the mocks are text placeholders; swap in real icons from whatever icon approach you set up (a question-mark-circle icon and a bar-chart icon), inline SVG is fine.

## Definition of done

- `npm run dev` launches the app and it's playable start to finish: type a guess, submit, see correct tile coloring including duplicate-letter edge cases, win or lose after 6 rows, see the result card, share button copies to clipboard, countdown ticks live.
- Reloading mid-game restores the in-progress board from `localStorage`; loading on a new day resets the board but keeps stats.
- Desktop (physical keyboard, no on-screen keyboard) and mobile (on-screen keyboard, touch) both work and match the README's layout specs at their respective breakpoints, including the board reflow behavior described for widths below 900px/720px/402px/360px.
- Keyboard-only navigation reaches every interactive element with a visible focus ring; tiles carry correct `aria-label`s; row outcomes are announced.
- A side-by-side comparison against `screenshots/1a-paper.png` and `1a-paper-board-no-overlay.png` shows matching layout, spacing, and color at both the desktop win-overlay state and the mobile in-progress state.
- No console errors/warnings in normal play.

When you're done, briefly summarize what you built and flag anything from the README you deviated from and why.
