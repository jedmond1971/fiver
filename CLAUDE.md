# FIVER

## Deployment

- Deployed on Vercel via the **web dashboard connected directly to the GitHub repo** (`jedmond1971/fiver`), not via local Vercel CLI — there is no `.vercel/` link folder, and the local `vercel` CLI is logged out. Deploys auto-trigger on push to `main`. Live at https://fiver-cyan-phi.vercel.app (Vercel project `jedmond1971-9191/fiver`).
- Vercel env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in the Vercel dashboard under Project Settings → Environment Variables — they are not synced from the local `.env`.
- Supabase project ref `qkoitdadzsovhqnozspi` (org `amoxlhznsxzhfbjmkgot`) is linked locally via the Supabase CLI. Check migration status with `supabase migration list` (may prompt for the DB password).

## `api/` — Vercel serverless functions

- `api/guess.ts` scores guesses server-side so the daily answer is never shipped to the client. `src/data/answers.json` (the full answer list) must **never** be imported from anything under `src/` — only from `api/_lib/answers.ts`. Client code only ever learns the answer via the `/api/guess` response, and only on a correct guess or the 6th guess.
- **Vercel's Node runtime transpiles `api/**/*.ts` files individually — it does not bundle them.** This means relative imports anywhere in the `api/` dependency chain (including ones reaching into `src/`) need real `.js` extensions matching the compiled output (e.g. `from '../../src/game/evaluate.js'`, even though the source file is `.ts`). Bare specifiers or `.ts`-suffixed imports build and pass tests fine locally (Vite/esbuild bundles everything, masking the issue) but fail in production with `ERR_MODULE_NOT_FOUND`. This has already caused one bad production deploy — check this first if `/api/guess` ever 500s after a change to files in that chain.
- To verify an `api/` change will actually work on Vercel before pushing (Vite's dev server is not representative — it bundles, Vercel doesn't): transpile with `npx tsc --project api/tsconfig.json --outDir /tmp/vercel-sim --rootDir .`, copy the referenced `src/data/*.json` files into matching relative paths under the output dir, then run the compiled `api/guess.js` under plain `node` with a fake req/res.
- `npm run dev` scores guesses locally via a Vite dev-server middleware in `vite.config.ts` that mirrors `api/guess.ts` — not `vercel dev`.
- `api/` has its own `tsconfig.json` (bundler-mode resolution, unlike the Node-runtime's actual strict-extension requirement above), referenced from the root `tsconfig.json` alongside `tsconfig.app.json` and `tsconfig.node.json`. `npm run build` (`tsc -b`) type-checks all three projects.

## Game input & modals

- `src/game/useFiverGame.ts` attaches a global `window` `keydown` listener that feeds physical/on-screen-keyboard keystrokes into the board. It ignores events whose target is inside an `input`/`textarea`/`select`/`[contenteditable]`, and also respects a `blocked` boolean passed as the hook's second argument (`useFiverGame(userId, blocked)`). Any new full-screen modal that should pause board input while open needs to be OR'd into that `blocked` value in `App.tsx` (or added to the hook's internal `helpOpen`/`resultOpen`-style early-return list) — just rendering it on top isn't enough to stop keystrokes leaking into the board underneath.

## Theme music

- `public/theme-music.mp3` is looped via `src/hooks/useThemeMusic.ts` while the welcome screen (and any sign-in/sign-up flow launched from it) is active; preloaded early via a `<link rel="preload" as="audio">` in `index.html`.
- Some mobile browsers don't reject a blocked `audio.play()` synchronously — they queue it and can resolve it later, off the back of an unrelated later gesture. Code calling `.play()` needs to guard against that late resolution (track current intent in a ref and re-`pause()` if it resolves after intent changed), or stray audio can start playing well after the moment that triggered it.
- Sound on/off preference lives in localStorage key `fiver:sound` (`loadSoundEnabled`/`saveSoundEnabled` in `src/game/storage.ts`), default enabled unless explicitly `'false'`.

## Environment quirks

- This repo has had recurring stale `.git/index.lock` / `.git/HEAD.lock` files left over from an earlier crashed git process (there's also a pre-existing `_to_delete/stale-index.lock` from the same pattern). If a git command fails with "Unable to create '.git/*.lock': File exists", check `ps aux` for an actual running git process first — if none is running, the lock file is stale and safe to remove.
- Vite's dev-server HMR doesn't reliably hot-apply edits to plain (non-component) files like `src/game/useFiverGame.ts` — a change can fail to take effect in the running preview even though the file is saved. If behavior doesn't seem to match the code during manual testing, hard-reload the page (or navigate with `force: true`) before concluding the change is wrong.
