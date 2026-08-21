# Handoff: FIVER — daily word game (Wordle-style)

## Overview
FIVER is a daily five-letter word guessing game playable in a desktop or mobile browser.
A player gets six guesses at a five-letter word. After each submitted guess, every tile is
colored: right letter in the right place, right letter in the wrong place, or not in the word.
Solving the word reveals a result/share card with streak stats and a countdown to the next puzzle.

This handoff covers three visual directions for the same product (pick one, or mix):
- **1a Paper** — warm paper neutral, classic centered board, stats in the header, win state as a centered modal overlay.
- **1b Editorial** — off-white print feel, serif masthead, persistent left rail holding stats/streak/share result, legend under the board.
- **1c Night** — dark first, monospace letterforms, oversized rounded tiles, share panel sitting beside the board.

Only **1a** is required to ship. 1b and 1c are alternates.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended
look and structure, not production code to copy directly. The task is to **recreate these designs
in the target codebase's existing environment** (React, Vue, Svelte, SwiftUI, native, etc.) using
its established patterns, component library, and styling approach. If no environment exists yet,
choose an appropriate framework and implement there.

`FIVER Word Game.dc.html` uses a custom streaming-template runtime; do not try to reuse it.
Read it as a spec for markup structure and inline styles only. The two `.jsx` files are device/browser
mockup chrome (an iPhone bezel and a Chrome window) used to present the design — **they are not part
of the product** and should not be ported.

## Fidelity
**High fidelity.** Colors, type, tile sizes, gaps, and copy are final and exact — recreate pixel-close.
Not covered by the mocks (needs implementation judgment, described below in words): tile flip
animation timing, invalid-word shake, toast copy, how-to-play modal, settings panel, loss state.

---

## Screens / Views

### 1. Desktop board — solved state (1a Paper)
**Purpose:** the primary desktop play surface; shown here at the moment the player solves the word.

**Layout** (viewport-filling, background `#f6f4ef`, flex column):
- **Header bar**: height 66px, `padding: 0 28px`, `border-bottom: 1px solid #ded8cc`, contents vertically centered, space-between.
  - Left cluster (`gap: 14px`): wordmark `FIVER` — 21px / weight 700 / `letter-spacing: .34em` / `#17181a`; then `NO. 842 · AUG 21` — 12px / `#8a857c` / `letter-spacing: .06em`.
  - Right cluster (`gap: 22px`): `17` (19px, 600, `#17181a`) + label `STREAK` (11px, `#8a857c`, `letter-spacing: .1em`), baseline-aligned, `gap: 7px`; a 1px × 22px `#ded8cc` divider; `94%` + `WINS` same treatment; then two 34×34 icon buttons (`border: 1px solid #ded8cc`, `border-radius: 8px`, glyph 13-14px `#8a857c`) — help and stats.
- **Board area**: fills remaining height, contents centered both axes.
  - 6 rows × 5 tiles. Tile 64×64, `border-radius: 4px`, `border: 1.5px solid`, letter 30px / weight 600 / `letter-spacing: .02em`, centered. Gap 8px between tiles and between rows.
- **Win overlay**: full-bleed scrim `rgba(23,24,26,.32)`, card centered.
  - Card: width 392px, background `#fffefb`, `border: 1px solid #ded8cc`, `border-radius: 14px`, `padding: 30px 30px 26px`, `box-shadow: 0 24px 60px rgba(23,24,26,.22)`, column, centered, `gap: 4px`.
  - `SOLVED IN 3` — 11px, `letter-spacing: .16em`, `#8a857c`.
  - `Splendid` — Instrument Serif 38px, `#17181a`, `line-height: 1.1`.
  - `Today's word was PRISM` — 13px `#8a857c`, the word in `#4a7a5c` weight 600, `margin-bottom: 14px`.
  - Mini result grid: 3 rows × 5 blocks, block 20×20, `border-radius: 3px`, gap 4px, `padding: 14px 0 18px`.
  - Stats row: four columns, `gap: 26px`, each = number (22px, 600, `#17181a`) over label (10px, `letter-spacing: .09em`, `#8a857c`): `128 PLAYED`, `94 WIN %`, `17 STREAK`, `31 BEST`. `padding-bottom: 18px`, `border-bottom: 1px solid #ece7dd`.
  - Footer row (`padding-top: 18px`, space-between): `Next word in 07:12:44` — 13px `#8a857c`, time in `#17181a` with `font-variant-numeric: tabular-nums`; Share button — background `#4a7a5c`, `#fff`, 13px/600, `padding: 10px 20px`, `border-radius: 8px`.

### 2. Mobile board — in-progress state (1a Paper)
**Purpose:** primary mobile play surface, mid-game with a partially typed guess.

Designed against a 402 × 874 logical viewport (iPhone 16-class). Background `#f6f4ef`, flex column.
- **Header**: height 52px, `padding: 0 18px`, `border-bottom: 1px solid #ded8cc`. Help glyph left (15px `#8a857c`), wordmark `FIVER` centered (16px/700, `letter-spacing: .3em`), stats glyph right. Both side slots are fixed 30px wide so the wordmark stays optically centered.
- **Board**: fills remaining space, centered. Tile 58×58, gap 6px, `border-radius: 4px`, `border: 1.5px solid`, letter 27px/600.
- **Keyboard**: pinned to bottom, `padding: 10px 5px 42px` (the 42px clears the home indicator / browser chrome). Three rows, row gap 8px, key gap 6px, row `padding: 0 3px`.
  - Key: height 52px, `border-radius: 6px`, `flex-basis: 0`, `flex-grow: 1` (letters) or `1.6` (Enter `↵`, Backspace `⌫`), label 15px/600, centered.
  - Rows: `QWERTYUIOP` / `ASDFGHJKL` / `↵ Z X C V B N M ⌫`.
  - Unused key: background `#e7e2d8`, text `#17181a`. Evaluated keys take the tile color with `#fff` text.

### 3. Desktop board — solved state (1b Editorial)
Background `#fffdf8`, horizontal split.
- **Left rail**: width 296px, `border-right: 1px solid #e6e0d4`, `padding: 30px 26px`, column `gap: 26px`.
  - Masthead `Fiver` — Instrument Serif 40px, `line-height: 1`, `#17181a`; under it `DAILY EDITION · NO. 842` — 11px, `letter-spacing: .14em`, `#9a938a`, `margin-top: 8px`.
  - 1px `#e6e0d4` rule.
  - Three stat rows (`gap: 14px`), each space-between baseline: label 12.5px `#6f6a62` / value Instrument Serif 24px `#17181a` — `Current streak 17`, `Longest streak 31`, `Win rate 94%`.
  - 1px rule. Then `TODAY'S RESULT` (11px, `.14em`, `#9a938a`), mini grid (22×22 blocks, `border-radius: 2px`, gap 4px), sentence `Solved in three. The word was PRISM.` (12.5px `#6f6a62`, `line-height: 1.5`, word in `#2f6b4f` 600), and a `Share result` button — `border: 1px solid #17181a`, `border-radius: 2px`, 12.5px/600, `padding: 9px 0`, full width.
  - Spacer, then `Next edition in 07:12:44` at the bottom (12px `#9a938a`, time `#17181a` tabular).
- **Board column**: centered, `gap: 26px`. Tile 66×66, **square corners**, `border: 1px solid`, letter Instrument Serif 34px. Tile and row gap 7px.
- **Legend** under the board: three items, `gap: 20px`, each a 12×12 square swatch + 11.5px `#6f6a62` label — `right place` `#2f6b4f`, `wrong place` `#b8862b`, `not in word` `#b3aca1`.

### 4. Mobile board — in-progress (1b Editorial)
Background `#fffdf8`. Header is left-aligned instead of centered: `padding: 6px 20px 14px`, `border-bottom: 1px solid #e6e0d4`, items baseline space-between. `Fiver` in Instrument Serif 30px with `NO. 842 · 17 DAY STREAK` beneath (10px, `.13em`, `#9a938a`); help + stats glyphs right (13px `#9a938a`, `gap: 14px`).
Tiles 58×58 square-cornered, `border: 1px solid`, letters Instrument Serif 30px, gap 6px. Keyboard identical geometry to 1a but `border-radius: 3px`, weight 500, unused key `#f2ece0`.

### 5. Desktop board — solved state (1c Night)
Background `#15161a`.
- **Header**: height 64px, `padding: 0 28px`, `border-bottom: 1px solid #2b2e35`. Left: `FIVER` in DM Mono 18px/500, `letter-spacing: .3em`, `#f2f0ec`. Right cluster (`gap: 18px`): `842` (DM Mono 12px `#8b8f98`, `.1em`); a `HARD MODE` pill — background `#2a2d34`, `border-radius: 999px`, `padding: 6px 11px`, 11.5px `#d0a54a`; `17 STREAK`; two 32×32 circular icon buttons (`border: 1px solid #2b2e35`, `border-radius: 999px`, glyph `#8b8f98`).
- **Body**: board and result panel side by side, `gap: 64px`, centered, `padding: 0 40px`.
  - Tile 70×70, `border-radius: 10px`, `border: 1.5px solid`, letter DM Mono 32px/500. Tile and row gap 9px.
  - Result panel, width 280px, column `gap: 20px`: headline `Three guesses. / Clean work.` (Instrument Serif 34px, `line-height: 1.15`, `#f2f0ec`, break after "guesses."); mini grid (22×22, `border-radius: 5px`, gap 4px); button pair `gap: 9px` — `Share` filled `#f2f0ec` on `#15161a` text, 13px/600, `padding: 11px 0`, `border-radius: 8px`, and `Stats` outlined `1px #2b2e35` with `#c8ccd4` text; footer `NEXT WORD 07:12:44` in DM Mono 11.5px `#8b8f98`.

### 6. Mobile board — in-progress (1c Night)
Dark status bar. Header height 50px, `border-bottom: 1px solid #2b2e35`, wordmark DM Mono 15px/500 `.28em`. Tiles 58×58, `border-radius: 9px`, `border: 1.5px solid`, letters DM Mono 27px/500, gap 7px. Keyboard keys `border-radius: 7px`, DM Mono 15px/500, unused key `#2a2d34` with `#e9e7e3` text.

---

## Sample game state used in the mocks
Answer: **PRISM**. Guess history:

| # | Guess | Per-letter result |
|---|-------|-------------------|
| 1 | SLATE | S = wrong place, L A T E = absent |
| 2 | MINOR | M = wrong place, I = wrong place, N O = absent, R = wrong place |
| 3 | PRISM | all correct |

The **solved** boards show all three rows evaluated plus three empty rows.
The **in-progress** mobile boards show rows 1–2 evaluated, row 3 mid-typing with `P R I` and two empty
cells, plus three empty rows. A typed-but-unsubmitted tile has a transparent background with a
**dark border in the ink color** (`#17181a` light themes, `#f2f0ec` on Night) — that is the only
signal distinguishing a typed tile from an empty one.
Keyboard state in the in-progress mocks: `S M I R` = wrong place, `L A T E N O` = absent, rest untouched.

---

## Interactions & Behavior
Not depicted in the static mocks — implement as follows.

- **Typing**: physical keyboard on desktop (A–Z, Enter, Backspace); on-screen keyboard on mobile. The on-screen keyboard is **mobile only** — do not render it on desktop. Letters fill the active row left to right; Backspace removes the last letter.
- **Submit** (Enter): only when the row holds 5 letters.
  - Not a real word / too short → row shakes horizontally (translateX ±6px, ~500ms, 4 oscillations) and a small dark toast appears above the board for ~1.5s ("Not enough letters", "Not in word list").
  - Valid → tiles flip in sequence: each tile does a Y-axis flip (`rotateX`) over ~300ms, staggered 150ms per tile, revealing its color at the midpoint. Total row reveal ~1s. Matching keyboard keys recolor after the row finishes.
- **Win**: after the winning row reveals, tiles do a short bounce (staggered ~100ms), then the result card appears — modal overlay (1a), rail update (1b), side panel (1c). Fade + 12px rise, ~250ms ease-out.
- **Loss** (row 6 wrong): same result card, headline replaced with the answer revealed, e.g. `The word was PRISM`, no "solved in" line.
- **Share**: copies a plain-text emoji-block grid plus `FIVER 842 3/6` to the clipboard; button briefly shows `Copied`.
- **Countdown**: ticks each second to the next local-midnight puzzle.
- **Hover** (desktop, pointer devices only): icon buttons lighten background ~4%; Share button darkens ~6%. Keys get no hover on touch.
- **Focus**: visible 2px outline in the theme accent for keyboard-only users on all interactive elements.
- **Responsive**: single centered column throughout. Board scales by tile size, not media-query rewrites — 64–70px desktop, 58px at 402px wide, shrink to ~50px below 360px so five tiles plus gaps always fit. 1b's left rail collapses into the mobile header below ~900px. Header stat cluster drops the WINS pair below ~720px.
- **Accessibility**: color alone must not carry meaning — give each tile an `aria-label` ("P, correct", "R, present", "N, absent") and announce row results in a live region. Target 44px minimum for every key and icon button (the 52px keys and 34px icon buttons with padding satisfy this; do not shrink keys below 44px).

## State Management
- `answer` — today's five-letter word (string, uppercase).
- `puzzleNumber`, `puzzleDate`.
- `guesses` — array of submitted uppercase strings (max 6).
- `current` — the row being typed (string, 0–5 chars).
- `status` — `playing` | `won` | `lost`.
- `revealing` — boolean, locks input during the flip animation.
- `toast` — transient message string or null.
- `stats` — `{ played, wins, currentStreak, maxStreak, distribution[6] }`.
- `resultOpen` — result card visibility (auto-opens on win/loss, re-openable from the stats icon).
- `hardMode`, `darkMode` — settings flags (Night is a theme, so `darkMode` may just swap the token set).

Transitions: key press → `current`; Enter → validate → `revealing` true → append to `guesses`, clear `current` → on completion set `status` and update `stats` → `resultOpen`.

Persistence: store the day's board, `status`, and `stats` in local storage keyed by puzzle number so a
reload restores the in-progress game; a new puzzle number resets the board but keeps stats.
Derive letter states server-side or in a pure function — handle duplicate letters correctly
(mark exact matches first, then consume remaining letter counts for wrong-place marks).

## Design Tokens

### Colors
| Role | 1a Paper | 1b Editorial | 1c Night |
|---|---|---|---|
| Page background | `#f6f4ef` | `#fffdf8` | `#15161a` |
| Surface / card | `#fffefb` | `#fffdf8` | `#1d1f24` |
| Ink (primary text) | `#17181a` | `#17181a` | `#f2f0ec` |
| Muted text | `#8a857c` | `#6f6a62` (secondary), `#9a938a` (labels) | `#8b8f98` |
| Border / rule | `#ded8cc` (also `#ece7dd` inner) | `#e6e0d4` | `#2b2e35` |
| Tile border, empty | `#d7d1c4` | `#ded7c9` | `#33373f` |
| Correct | `#4a7a5c` | `#2f6b4f` | `#5f9e78` |
| Wrong place | `#c2933c` | `#b8862b` | `#d0a54a` |
| Absent | `#a8a29a` | `#b3aca1` | `#464a53` |
| On-state text | `#ffffff` | `#fffdf8` | `#121316` |
| Keyboard key, unused | `#e7e2d8` | `#f2ece0` | `#2a2d34` |
| Keyboard key text | `#17181a` | `#17181a` | `#e9e7e3` |
| Overlay scrim | `rgba(23,24,26,.32)` | — | — |
| Accent (Night pill) | — | — | `#d0a54a` |

Tile backgrounds for empty and typed states are **transparent** (the page background shows through), not a surface color.

### Typography
- `Instrument Sans` (400/500/600/700) — all UI, and the letterforms in 1a.
- `Instrument Serif` (400) — 1b masthead, stat values, and tile letters; the win headline in 1a and 1c.
- `DM Mono` (400/500) — everything in 1c: wordmark, tile letters, keys, numerals.
- Scale in use: 40, 38, 34, 32, 30, 27, 24, 22, 21, 19, 18, 17, 16, 15, 14, 13, 12.5, 12, 11.5, 11, 10.5, 10 px.
- Tracking: wordmarks `.28em`–`.34em`; small caps-style labels `.06em`–`.16em`; body 0.
- All numerals in countdowns use `font-variant-numeric: tabular-nums`.

### Spacing
4px base. Values used: 4, 6, 7, 8, 9, 10, 11, 14, 18, 20, 22, 26, 28, 30, 36, 42, 64.
Board gaps: 8 (1a desktop), 7 (1b desktop), 9 (1c desktop), 6–7 (mobile).
Mobile keyboard bottom padding 42px.

### Radius
`0` (1b tiles and buttons, radius 2 on the share button) · `3` · `4` (1a tiles) · `5` · `6` (1a keys) · `7` (1c keys) · `8` (buttons, icon buttons) · `9`–`10` (1c tiles) · `14` (win card) · `999` (1c pills and icon buttons).

### Shadow
Win card only: `0 24px 60px rgba(23,24,26,.22)`. Everything else is flat with 1px borders.

### Sizes
Tile: 64 (1a desktop) · 66 (1b) · 70 (1c) · 58 (all mobile).
Key height 52. Icon button 34 (1a/1b) · 32 (1c). Header 66 / 64 / 52 / 50. 1b rail 296. 1c result panel 280. Win card 392.

## Assets
No image, icon, or font assets beyond the three Google Fonts above. The help (`?`) and stats (`▤`)
glyphs in the mocks are **text placeholders** — replace with real icons from the codebase's icon set
(a question-mark-circle and a bar-chart icon). No brand assets are involved; the design is original
and deliberately not NYT Wordle's branding — keep it that way in the shipped product.

## Screenshots

`screenshots/` holds 1x captures of each direction (desktop + mobile side by side):
- `1a-paper.png` — 1a with the win overlay up.
- `1a-paper-board-no-overlay.png` — same, overlay hidden, so the full desktop board is visible.
- `1b-editorial.png`
- `1c-night.png`

The README values are authoritative where a screenshot and the text disagree.

## Files
- `FIVER Word Game.dc.html` — the design reference. Contains all six views (three directions × desktop + mobile) as an options board. Read it for exact markup structure and inline styles.
- `ios-frame.jsx`, `browser-window.jsx` — presentation-only mockup chrome (iPhone bezel, Chrome window). **Not part of the product; do not port.**
