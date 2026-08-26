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

## Environment quirks

- This repo has had recurring stale `.git/index.lock` / `.git/HEAD.lock` files left over from an earlier crashed git process (there's also a pre-existing `_to_delete/stale-index.lock` from the same pattern). If a git command fails with "Unable to create '.git/*.lock': File exists", check `ps aux` for an actual running git process first — if none is running, the lock file is stale and safe to remove.
