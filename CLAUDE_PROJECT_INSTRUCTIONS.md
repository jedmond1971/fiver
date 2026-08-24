# FIVER — Claude Project instructions

Paste this into the Project's **custom instructions**. If the Project also supports uploading knowledge files, add these four for full context: `design_handoff_fiver_word_game/README.md`, the project root `README.md`, `src/styles/tokens.css`, and this instructions file itself.

---

## What FIVER is

FIVER is Jamie's own Wordle-style daily five-letter word game. Player gets six guesses at a five-letter word; tiles color as correct/present/absent after each guess. Original branding and copy — deliberately not NYT Wordle's.

## Current state (as of Aug 2026)

Built and working end-to-end, verified independently (tests pass, production build is clean, design tokens match spec exactly):

- **Stack**: React 19 + TypeScript (strict) + Vite 8, plain CSS with design tokens as CSS custom properties (no UI framework/Tailwind). Vitest for unit tests.
- **No backend yet** — fully static/client-side. Game state and stats persist to `localStorage`, keyed by puzzle number.
- **Scope shipped**: the "1a Paper" visual direction only (desktop + mobile), per `design_handoff_fiver_word_game/README.md`. Two other directions (1b Editorial, 1c Night) exist in that same handoff doc but were deliberately not built — don't build them unless Jamie asks.
- **Project layout**: `src/game/` holds pure game logic (`evaluate.ts` scoring, `puzzle.ts` daily word selection, `hardMode.ts`, `share.ts`, `storage.ts`) — deliberately separated from `src/components/` (React UI) so logic stays unit-testable. Word lists are bundled locally in `src/data/` (sourced from `Kinkelin/WordleCompetition` and `tabatkins/wordle-list`, MIT-licensed — see comment in `src/game/wordList.ts`).
- Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run test`.

## Source of truth for design/behavior

`design_handoff_fiver_word_game/README.md` is the authoritative design spec (exact colors, type, spacing, copy, interaction timing). When in doubt about how something should look or behave, defer to that file over improvising — it is unusually detailed on purpose. A few things it deliberately left open were judgment calls made during the build and documented in the root `README.md` / commit history: win headlines per guess count, the loss headline, the help-modal design, the epoch date used for puzzle numbering (2025-01-01), and the single desktop/mobile breakpoint (720px).

## Working conventions

- Keep game-logic changes as pure, tested functions in `src/game/` — don't inline scoring/state logic into components.
- Preserve the existing design tokens in `src/styles/tokens.css` rather than reintroducing hardcoded hex/px values; add new tokens the same way if new values are needed.
- Run `npm run test` and `npm run build` before considering a change done.
- Don't add dependencies (state libraries, CSS frameworks, backend SDKs) without flagging it — this has intentionally stayed a small, dependency-light codebase.

## Roadmap: accounts & authentication (next major initiative, not yet started)

Jamie wants to add user accounts so FIVER can be shared with others and track each player's real progress across devices, instead of today's per-browser `localStorage`. This is a real architecture decision, not yet made — **do not assume a specific backend, auth provider, or scope and start building.** Surface these as open questions the first time this comes up in a session, unless Jamie has already stated an answer earlier in that conversation:

1. **Backend**: managed (Supabase or Firebase) vs. a custom Node/Express + Postgres service. Supabase is the likely best fit for a project this size (Postgres + built-in auth + generous free tier, minimal backend code to hand-write) but Jamie hasn't committed to it.
2. **Auth method**: email/password, Google sign-in, or both.
3. **Guest play**: whether unauthenticated play should still work (matching today's experience, with local stats migrating into an account on first sign-in) or whether an account should be required.
4. **Social scope**: purely personal stats/streak syncing, vs. also adding a friends/leaderboard feature.

Once those are answered, the natural next deliverable is another Claude Code build prompt (like `CLAUDE_CODE_BUILD_PROMPT.md` in the project root, which covered the original 1a build) scoped to the accounts/auth work — covering schema, migration of existing localStorage stats into an account, and which parts of `src/game/storage.ts` become server calls vs. stay local.

## How to work with Jamie on this project

- Jamie is comfortable making product/scope calls but wants them surfaced as explicit choices (not silently decided) when the decision is architectural or has real trade-offs — auth/backend/hosting choices are exactly that kind of decision.
- Prefer proposing a recommended default with the trade-offs stated plainly, rather than an open-ended "what do you want."
- For actual implementation work, output is a build prompt handed to Claude Code (running locally against `/home/jamie/Projects/fiver`), not code written directly in this Project.
