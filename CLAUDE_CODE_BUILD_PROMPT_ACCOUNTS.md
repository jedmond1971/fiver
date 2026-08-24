# Build prompt for Claude Code — FIVER Accounts & Authentication

Copy everything below into Claude Code, run from the `fiver` project root (`/home/jamie/Projects/fiver`).

---

## Context

FIVER currently ships as a fully static client-side app (React 19 + TypeScript + Vite). Game state and stats live in `localStorage`, keyed by puzzle number, with no accounts and no cross-device sync. This build adds accounts so Jamie can share FIVER with others and track each player's real progress across devices.

The following decisions have already been made (JedForge FIVER-1) — do not revisit them:

1. **Backend**: Supabase (Postgres + built-in auth).
2. **Auth method**: both email/password and Google sign-in.
3. **Guest play**: stays supported. Unauthenticated play works exactly as it does today; local stats migrate into the account on first sign-in.
4. **Social scope**: personal stats/streak syncing **and** a friends/leaderboard feature.

## Goal

Add Supabase-backed accounts and auth to FIVER without breaking guest play, migrate a guest's existing `localStorage` stats into their account on first sign-in, and add a friends/leaderboard feature — while keeping the existing 1a Paper visual design, design tokens, and game logic untouched.

## Scope for this build

**In scope:**
- Supabase project wiring (env-based config, `@supabase/supabase-js` client).
- Email/password and Google OAuth sign-in/sign-up via Supabase Auth.
- Guest mode preserved as the default, unauthenticated experience — nothing changes for someone who never signs in.
- One-time migration of a guest's local `Stats` (and, if present, in-progress `StoredGame`) into their account on first successful sign-in.
- A `profiles` table (username, avatar optional, created at) and a `game_results` table recording each completed puzzle per user, replacing/supplementing the local `Stats` shape once signed in.
- A friends system (add/accept by username or email) and a leaderboard view scoped to a user's friends, showing streak/win-rate/games-played over a selectable window (e.g. all-time and last 30 days).
- Row-level security (RLS) policies so a user can only write their own results and only read profiles/results of people they're friends with (plus their own).
- Sign-in/sign-up UI, an account menu (sign out, view profile), and a leaderboard screen, all built in the existing 1a Paper visual language — warm paper background, `Instrument Sans`/`Instrument Serif`, the existing tokens in `src/styles/tokens.css`. Add new tokens the same way if new values are genuinely needed; don't hardcode hex/px.

**Out of scope — do not build:**
- 1b Editorial or 1c Night visual directions, or a theme switcher.
- Native/mobile app wrapper.
- Push notifications or email digests.
- Server-side puzzle-answer validation / anti-cheat hardening (see "Known limitation" below) — flag it in your summary but don't build it now.
- Any state management library beyond what's already in the app — Supabase's client + React state/context is sufficient; don't reach for Redux/Zustand/etc.

## New dependency

This is the one dependency addition the working conventions ask to flag: `@supabase/supabase-js`. It's required to talk to Supabase from the client and is expected/approved as part of this decision — no need to ask before adding it. Don't add anything beyond it (e.g. no separate auth-UI component library — build the forms by hand in the existing style, same as the rest of the app).

## Data model (Supabase / Postgres)

Design real migrations (Supabase CLI `supabase/migrations/`) for at least:

- **`profiles`** — `id` (uuid, FK to `auth.users.id`), `username` (unique, chosen at first sign-in), `avatar_url` (nullable), `created_at`.
- **`game_results`** — `id`, `user_id` (FK to `profiles.id`), `puzzle_number` (int), `guess_count` (int, null if lost), `won` (bool), `guesses` (text[] or jsonb, the actual guessed words — useful for a future share/replay feature), `created_at`. Unique constraint on `(user_id, puzzle_number)` so a puzzle can't be recorded twice.
- **`friendships`** — `id`, `requester_id`, `addressee_id`, `status` (`pending` / `accepted`), `created_at`. Model as a single row per pair with status, not two directional rows.

Derive `Stats` (played, wins, currentStreak, maxStreak, distribution) for a signed-in user from `game_results` — either computed client-side from the row set on load, or via a Postgres view/RPC if that proves simpler. Don't duplicate a separately-maintained `stats` table that can drift from `game_results`.

Write RLS policies for every table: a user can insert/select their own `game_results`; `profiles` and `game_results` are readable by the profile owner and by accepted friends (join through `friendships`); `friendships` rows are readable/writable by their two participants only.

## Auth flow

- Sign-in/sign-up entry point from the header (new icon button, consistent sizing/spacing with the existing help/stats icons).
- A modal (reuse the existing modal patterns from `HelpModal`/`ResultModal`) with email/password fields plus a "Continue with Google" button using Supabase's OAuth flow.
- On successful first sign-in for a given Supabase user: if `profiles` has no row for that user yet, prompt for a username, create the profile, then run the migration step below.
- Persist the Supabase session (its client does this by default via `localStorage`); on load, check for a session and treat the user as signed in if one exists.
- Sign-out clears the Supabase session and returns to guest mode — local `localStorage` game/stats are untouched by sign-out (don't delete a guest's local data just because they signed out).

## Guest → account migration

On first sign-in only (i.e., the moment a `profiles` row is created for that user):

1. Read the existing local `Stats` via `loadStats()` (`src/game/storage.ts`).
2. If `Stats.played > 0`, there's no per-puzzle breakdown available locally (today's `Stats` only stores aggregate counts, not individual results) — write one synthetic reconciliation, not fabricated per-puzzle rows: either (a) store the migrated aggregate as a starting baseline the UI can display as "N games played before you signed in," or (b) if you'd rather keep `game_results` as the single source of truth, only migrate today's in-progress/most-recent completed game as a real row and preserve the rest of the pre-signin aggregate as a separate `legacy_stats` jsonb column on `profiles`. Pick one, document the choice in your summary — don't silently drop the guest's history.
3. If a `StoredGame` for today's puzzle exists locally and is still `playing`, keep using local storage for the remainder of *that* game (don't try to migrate an in-progress board mid-guess); only write it to `game_results` once it resolves to `won`/`lost`.
4. After migration, don't clear the local keys — leaving them is harmless and avoids a data-loss bug if migration partially fails; just stop reading from them going forward for a signed-in user.

## Which parts of `src/game/storage.ts` become server calls vs. stay local

- `loadHardMode` / `saveHardMode` — **stay local** (`localStorage`) regardless of sign-in state; it's a device preference, not account data.
- `loadGame` / `saveGame` (today's in-progress board) — **stay local** even when signed in, for snappy offline-tolerant play; only the *resolved* result gets written to `game_results` server-side.
- `loadStats` / `saveStats` — **branch on auth state**: guest → unchanged, local as today. Signed in → derive `Stats` from `game_results` (see Data model above) instead of reading the local key; writes happen by inserting into `game_results` when a game resolves, not by writing an aggregate stats blob.

Keep this branching in `src/game/storage.ts` (or a thin new `src/game/remoteStorage.ts` alongside it) rather than scattering `if (user)` checks through components — the working convention of keeping game-logic/state logic out of components applies here too.

## Leaderboard UI

- A new screen/panel (reuse the icon-button pattern in the header) showing the signed-in user's friends ranked by a chosen metric — default to current streak, with a toggle for win % and games played over "all time" / "last 30 days."
- Friend management: search by username, send/accept/decline requests, remove a friend. Keep it simple — no notifications system, just a pending-requests list visible when the panel opens.
- Guests see a locked/empty state prompting sign-in rather than an error.

## Known limitation — flag, don't fix

`getPuzzleInfo()` in `src/game/puzzle.ts` derives today's answer entirely client-side from the bundled word list — anyone can read it from the shipped JS. That's fine for a purely local game, but once results feed a leaderboard, a motivated player could read the answer from the bundle instead of solving it. Don't build server-side answer validation in this pass (it would require moving answer selection behind an API call, which is a bigger change than this build is scoped for) — just note it plainly in your summary as a follow-up worth doing before leaderboards get real usage.

## Environment / config

- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to a new `.env.example` (don't commit a real `.env`); read them via Vite's `import.meta.env`.
- Confirm `.gitignore` already excludes `.env` (it should, but check).
- Note in your summary what Jamie still needs to do manually in the Supabase dashboard (create the project, enable Google as an OAuth provider and add its client ID/secret, run the migrations) — you can write the migrations but can't apply them without real credentials.

## Definition of done

- `npm run build` and `npm run test` both pass.
- A brand-new visitor with no account can still play exactly as today, with zero UI change to that flow beyond the new sign-in entry point in the header.
- Signing up (email/password) and signing in with Google both work against a real Supabase project (assume Jamie will supply credentials to test against).
- A guest with existing local stats who signs in for the first time sees their prior play reflected somewhere in their new account (per whichever migration approach you chose above), not silently discarded.
- Playing a puzzle while signed in writes a row to `game_results` and that user's stats/streak reflect it on next load, including after a hard refresh.
- Adding a friend and viewing the leaderboard shows both users ranked correctly.
- RLS policies actually prevent one user from reading/writing another's `game_results`/`profiles` who isn't a friend — verify this, don't just assume the policy SQL is correct.
- No console errors/warnings in normal play, signed in or as a guest.

When you're done, briefly summarize what you built, note the known limitation above and the manual Supabase dashboard steps Jamie still needs to do, and flag anything you deviated from and why.
