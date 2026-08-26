import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { handleGuess } from './api/_lib/guessHandler.ts'

// Mirrors api/guess.ts (the real Vercel Function used in production) so
// `npm run dev` can score guesses locally without needing `vercel dev`.
function apiDevMiddleware(): Plugin {
  return {
    name: 'fiver-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/guess', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        let raw = '';
        req.on('data', (chunk) => {
          raw += chunk;
        });
        req.on('end', () => {
          let parsed: unknown;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }
          const { status, body } = handleGuess(parsed);
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
})
